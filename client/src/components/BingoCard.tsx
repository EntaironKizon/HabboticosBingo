import { cn } from "@/lib/utils";

interface BingoCardProps {
  bingoCard: (number | string)[];
  markedNumbers: number[];
  calledNumbers: number[];
  onMarkNumber: (number: number | string) => void;
  disabled?: boolean;
}

// Función para detectar líneas ganadoras
function getWinningLines(bingoCard: (number | string)[], markedNumbers: number[]): number[][] {
  const winPatterns = [
    [0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24], // Horizontales
    [0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24], // Verticales
    [0,6,12,18,24],[4,8,12,16,20] // Diagonales
  ];

  return winPatterns.filter((pattern) =>
    pattern.every((index) => {
      const number = bingoCard[index];
      return number === "FREE" || markedNumbers.includes(number as number);
    })
  );
}

export function BingoCard({
  bingoCard,
  markedNumbers,
  calledNumbers,
  onMarkNumber,
  disabled = false,
}: BingoCardProps) {
  const handleCellClick = (number: number | string) => {
    if (disabled) return;

    console.log('BingoCard click:', {
      number,
      calledNumbers,
      isIncluded: calledNumbers.includes(number as number)
    });

    if (number === 'FREE') {
      onMarkNumber(number);
      playSoftTone(); // ✅ Sonido suave y más bajo para FREE
      return;
    }

    if (!calledNumbers.includes(number as number)) {
      console.log('Number not called yet, showing shake animation');
      const cell = document.querySelector(`[data-number="${number}"]`);
      if (cell) {
        cell.classList.add('shake');
        setTimeout(() => cell.classList.remove('shake'), 500);
      }
      return;
    }

    console.log('Calling onMarkNumber with:', number);
    onMarkNumber(number);
    playSoftTone(); // ✅ Sonido suave y más bajo al marcar número
  };

  const isMarked = (number: number | string) => {
    if (number === 'FREE') return true;
    return markedNumbers.includes(number as number);
  };

  const isCalled = (number: number | string) => {
    if (number === 'FREE') return false;
    return calledNumbers.includes(number as number);
  };

  // Detectar líneas ganadoras
  const winningLines = getWinningLines(bingoCard, markedNumbers);
  const winningCells = new Set(winningLines.flat());

  // Función para obtener la letra BINGO según la posición en la línea ganadora
  const getBingoLetter = (index: number): string => {
    // Encontrar en qué línea ganadora está esta celda
    for (const line of winningLines) {
      const positionInLine = line.indexOf(index);
      if (positionInLine !== -1) {
        return ['B', 'I', 'N', 'G', 'O'][positionInLine];
      }
    }
    // Fallback: usar la columna original
    const column = index % 5;
    return ['B', 'I', 'N', 'G', 'O'][column];
  };

  // 🎵 Función: Tono suave y agradable (volumen reducido a la mitad)
  const playSoftTone = () => {
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = 'triangle'; // Sonido más cálido
    oscillator.frequency.setValueAtTime(600, context.currentTime); // Frecuencia media-baja
    gainNode.gain.setValueAtTime(0.15, context.currentTime); // Volumen reducido a la mitad
    gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.5); // Duración larga y suave

    oscillator.connect(gainNode).connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + 0.5); // Totalmente suave y agradable
  };

  return (
    <div className={cn(
      "bg-white/10 backdrop-blur-md rounded-2xl p-6 border-4 border-habbo-purple",
      disabled && "opacity-60"
    )}>
      <h3 className="font-pixel text-white text-center mb-4 text-xl">
        TU CARTÓN
        {disabled && <span className="text-red-400 block text-sm">BLOQUEADO</span>}
      </h3>

      {/* B-I-N-G-O Header */}
      <div className="grid grid-cols-5 gap-2 mb-2">
        {['B', 'I', 'N', 'G', 'O'].map((letter) => (
          <div key={letter} className="bg-habbo-purple text-white font-pixel text-center py-2 rounded text-lg">
            {letter}
          </div>
        ))}
      </div>

      {/* Grid de números */}
      <div className="grid grid-cols-5 gap-2">
        {bingoCard.map((number, index) => {
          const isWinningCell = winningCells.has(index);
          const bingoLetter = getBingoLetter(index);
          
          const displayValue = number === 'FREE' ? (
            <span className="text-2xl font-extrabold text-habbo-purple drop-shadow-md z-10">
              ⭐
            </span>
          ) : (
            number.toString()
          );

          return (
            <div
              key={index}
              data-number={number}
              className={cn(
                "bingo-number bg-white border-2 border-habbo-purple rounded-lg flex items-center justify-center relative",
                !disabled && "hover:bg-gray-100 cursor-pointer",
                disabled && "cursor-not-allowed",
                isMarked(number) && "marked",
                isCalled(number) && "called",
                isWinningCell && "bingo-line-winner"
              )}
              onClick={() => handleCellClick(number)}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                {isWinningCell && isMarked(number) ? (
                  // Solo mostrar la letra BINGO en celdas ganadoras
                  <span className="text-4xl font-extrabold text-white bingo-letter animate-bounce z-20">
                    {bingoLetter}
                  </span>
                ) : (
                  // Mostrar contenido normal en celdas no ganadoras
                  <>
                    <span
                      className={cn(
                        "text-2xl font-extrabold text-habbo-purple drop-shadow-md z-10",
                        isMarked(number) && "hidden"
                      )}
                    >
                      {displayValue}
                    </span>

                    {isMarked(number) && (
                      <span className="star-icon absolute inset-0 m-auto w-6 h-6 text-yellow-400 animate-pulse">
                        ⭐
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
