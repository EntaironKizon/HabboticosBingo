import { cn } from "@/lib/utils";

interface BingoCardProps {
  bingoCard: (number | string)[];
  markedNumbers: number[];
  calledNumbers: number[];
  onMarkNumber: (number: number | string) => void;
  disabled?: boolean;
}

export function BingoCard({ bingoCard, markedNumbers, calledNumbers, onMarkNumber, disabled = false }: BingoCardProps) {
  const handleCellClick = (number: number | string) => {
    // Si el juego está deshabilitado (bloqueado), no permitir clics
    if (disabled) {
      return;
    }

    console.log('BingoCard click:', {
      number,
      calledNumbers,
      isIncluded: calledNumbers.includes(number as number)
    });

    // La casilla FREE se puede marcar siempre
    if (number === 'FREE') {
      onMarkNumber(number);
      return;
    }

    // Check if number has been called
    if (!calledNumbers.includes(number as number)) {
      console.log('Number not called yet, showing shake animation');
      // Add shake animation for invalid clicks
      const cell = document.querySelector(`[data-number="${number}"]`);
      if (cell) {
        cell.classList.add('shake');
        setTimeout(() => cell.classList.remove('shake'), 500);
      }
      return;
    }

    console.log('Calling onMarkNumber with:', number);
    onMarkNumber(number);
  };

  const isMarked = (number: number | string) => {
    if (number === 'FREE') return true;
    return markedNumbers.includes(number as number);
  };

  const isCalled = (number: number | string) => {
    if (number === 'FREE') return false;
    return calledNumbers.includes(number as number);
  };

  return (
    <div className={cn(
      "bg-white/10 backdrop-blur-md rounded-2xl p-6 border-4 border-habbo-purple",
      disabled && "opacity-60"
    )}>
      <h3 className="font-pixel text-white text-center mb-4">
        TU CARTÓN
        {disabled && <span className="text-red-400 block text-sm">BLOQUEADO</span>}
      </h3>

      {/* Bingo Header (B-I-N-G-O) */}
      <div className="grid grid-cols-5 gap-2 mb-2">
        {['B', 'I', 'N', 'G', 'O'].map((letter) => (
          <div key={letter} className="bg-habbo-purple text-white font-pixel text-center py-2 rounded">
            {letter}
          </div>
        ))}
      </div>

      {/* Bingo Numbers Grid */}
      <div className="grid grid-cols-5 gap-2">
        {bingoCard.map((number, index) => {
          const displayValue = number === 'FREE' ? 'FREE' : number.toString();

          return (
            <div
              key={index}
              data-number={number}
              className={cn(
                "bingo-number bg-white border-2 border-habbo-purple rounded-lg flex items-center justify-center text-sm font-bold",
                !disabled && "hover:bg-gray-100 cursor-pointer",
                disabled && "cursor-not-allowed",
                isMarked(number) && "marked",
                isCalled(number) && "called"
              )}
              onClick={() => handleCellClick(number)}
            >
              {displayValue}
            </div>
          );
        })}
      </div>
    </div>
  );
}