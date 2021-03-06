'use strict';

/**
 * Returns the bank account number parsed from specified string.
 *
 * You work for a bank, which has recently purchased an ingenious machine to assist in reading letters and faxes sent in by branch offices.
 * The machine scans the paper documents, and produces a string with a bank account that looks like this:
 *
 *    _  _     _  _  _  _  _
 *  | _| _||_||_ |_   ||_||_|
 *  ||_  _|  | _||_|  ||_| _|
 *
 * Each string contains an account number written using pipes and underscores.
 * Each account number should have 9 digits, all of which should be in the range 0-9.
 *
 * Your task is to write a function that can take bank account string and parse it into actual account numbers.
 *
 * @param {string} bankAccount
 * @return {number}
 *
 * Example of return :
 *
 *   '    _  _     _  _  _  _  _ \n'+
 *   '  | _| _||_||_ |_   ||_||_|\n'+     =>  123456789
 *   '  ||_  _|  | _||_|  ||_| _|\n'
 *
 *   ' _  _  _  _  _  _  _  _  _ \n'+
 *   '| | _| _|| ||_ |_   ||_||_|\n'+     => 23056789
 *   '|_||_  _||_| _||_|  ||_| _|\n',
 *
 *   ' _  _  _  _  _  _  _  _  _ \n'+
 *   '|_| _| _||_||_ |_ |_||_||_|\n'+     => 823856989
 *   '|_||_  _||_| _||_| _||_| _|\n',
 *
 */
function parseBankAccount(bankAccount) {
    const nums = [
        ' _ | ||_|',
        '     |  |', 
        ' _  _||_ ',
        ' _  _| _|',
        '   |_|  |',
        ' _ |_  _|',
        ' _ |_ |_|',
        ' _   |  |',
        ' _ |_||_|',
        ' _ |_| _|'
    ];
    const result = bankAccount
        .split('\n')
        .map((line) => line.split(/(.{3})/).filter(Boolean))
        .reduce((acc, line) => {
            line.forEach((subline, idx) => acc[idx] += subline);
            return acc;
        }, Array(9).fill(''))
        .map((num) => nums.indexOf(num))
        .reduce((acc, num) => (acc * 10) + num);

    return result;
}


/**
 * Returns the string, but with line breaks inserted at just the right places to make sure that no line is longer than the specified column number.
 * Lines can be broken at word boundaries only.
 *
 * @param {string} text
 * @param {number} columns
 * @return {Iterable.<string>}
 *
 * @example :
 *
 *  'The String global object is a constructor for strings, or a sequence of characters.', 26 =>  'The String global object',
 *                                                                                                'is a constructor for',
 *                                                                                                'strings, or a sequence of',
 *                                                                                                'characters.'
 *
 *  'The String global object is a constructor for strings, or a sequence of characters.', 12 =>  'The String',
 *                                                                                                'global',
 *                                                                                                'object is a',
 *                                                                                                'constructor',
 *                                                                                                'for strings,',
 *                                                                                                'or a',
 *                                                                                                'sequence of',
 *                                                                                                'characters.'
 */
function* wrapText(text, columns) {
    const lines =  text.match(new RegExp(`(?!\\s).{1,${columns}}(?=(\\s|$))`, 'g'));
    for (const line of lines) yield line;
}


/**
 * Returns the rank of the specified poker hand.
 * See the ranking rules here: https://en.wikipedia.org/wiki/List_of_poker_hands.
 *
 * @param {array} hand
 * @return {PokerRank} rank
 *
 * @example
 *   [ '4♥','5♥','6♥','7♥','8♥' ] => PokerRank.StraightFlush
 *   [ 'A♠','4♠','3♠','5♠','2♠' ] => PokerRank.StraightFlush
 *   [ '4♣','4♦','4♥','4♠','10♥' ] => PokerRank.FourOfKind
 *   [ '4♣','4♦','5♦','5♠','5♥' ] => PokerRank.FullHouse
 *   [ '4♣','5♣','6♣','7♣','Q♣' ] => PokerRank.Flush
 *   [ '2♠','3♥','4♥','5♥','6♥' ] => PokerRank.Straight
 *   [ '2♥','4♦','5♥','A♦','3♠' ] => PokerRank.Straight
 *   [ '2♥','2♠','2♦','7♥','A♥' ] => PokerRank.ThreeOfKind
 *   [ '2♥','4♦','4♥','A♦','A♠' ] => PokerRank.TwoPairs
 *   [ '3♥','4♥','10♥','3♦','A♠' ] => PokerRank.OnePair
 *   [ 'A♥','K♥','Q♥','2♦','3♠' ] =>  PokerRank.HighCard
 */
const PokerRank = {
    StraightFlush: 8,
    FourOfKind: 7,
    FullHouse: 6,
    Flush: 5,
    Straight: 4,
    ThreeOfKind: 3,
    TwoPairs: 2,
    OnePair: 1,
    HighCard: 0
}

function getPokerHandRank(hand) {
    let numbers = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    hand.some((card) => parseInt(card) === 2) ? numbers.unshift('A') : numbers.push('A');
    const getNumber = (card) => card.slice(0, -1);
    const getType = (card) => card.slice(-1);
    const countEqualNumber = (arr, count) => {
        return arr.filter((numberCount) => count === numberCount).length;
    }
    
    const countEqualTypes = hand.reduce((acc, card, idx, arr) => {
        const isEqualType = (idx === 0 || getType(card) === getType(arr[idx - 1]));
        return isEqualType ? acc + 1 : 0 
    }, 0);

    const handNumbers = hand.reduce((acc, card) => {
        const index = numbers.indexOf(getNumber(card));
        acc[index] = acc[index] ? acc[index] + 1 : 1;
        return acc;
    }, []);

    const hasOrder = hand
                        .map((card) => numbers.indexOf(getNumber(card)))
                        .sort((a, b) => a - b)
                        .every((number, idx, arr) => (idx === 0 || number == arr[idx - 1] + 1));

    const hasOneType = countEqualTypes === 5;
    let pokerRank = PokerRank.HighCard;
    
    if (hasOrder && hasOneType) pokerRank = PokerRank.StraightFlush;
    else if (hasOrder) pokerRank = PokerRank.Straight;
    else if (hasOneType) pokerRank = PokerRank.Flush;
    else if (countEqualNumber(handNumbers, 2) && countEqualNumber(handNumbers, 3)) pokerRank = PokerRank.FullHouse;
    else if (countEqualNumber(handNumbers, 2) === 1) pokerRank = PokerRank.OnePair;
    else if (countEqualNumber(handNumbers, 2) === 2) pokerRank = PokerRank.TwoPairs;
    else if (countEqualNumber(handNumbers, 3)) pokerRank = PokerRank.ThreeOfKind;
    else if (countEqualNumber(handNumbers, 4)) pokerRank = PokerRank.FourOfKind;

    return pokerRank;
}


/**
 * Returns the rectangles sequence of specified figure.
 * The figure is ASCII multiline string comprised of minus signs -, plus signs +, vertical bars | and whitespaces.
 * The task is to break the figure in the rectangles it is made of.
 *
 * NOTE: The order of rectanles does not matter.
 * 
 * @param {string} figure
 * @return {Iterable.<string>} decomposition to basic parts
 * 
 * @example
 *
 *    '+------------+\n'+
 *    '|            |\n'+
 *    '|            |\n'+              '+------------+\n'+
 *    '|            |\n'+              '|            |\n'+         '+------+\n'+          '+-----+\n'+
 *    '+------+-----+\n'+       =>     '|            |\n'+     ,   '|      |\n'+     ,    '|     |\n'+
 *    '|      |     |\n'+              '|            |\n'+         '|      |\n'+          '|     |\n'+
 *    '|      |     |\n'               '+------------+\n'          '+------+\n'           '+-----+\n'
 *    '+------+-----+\n'
 *
 *
 *
 *    '   +-----+     \n'+
 *    '   |     |     \n'+                                    '+-------------+\n'+
 *    '+--+-----+----+\n'+              '+-----+\n'+          '|             |\n'+
 *    '|             |\n'+      =>      '|     |\n'+     ,    '|             |\n'+
 *    '|             |\n'+              '+-----+\n'           '+-------------+\n'
 *    '+-------------+\n'
 */
function* getFigureRectangles(figure) {
    const buildRectangle = (width, height) => {
        const innerWidth = width - 2;
        const innerHeight = height - 2;
        const horizontalBorder = '-';
        const verticalBorder = '|';
        const corner = '+';
        const fill = ' ';
    
        let rectangle = corner + horizontalBorder.repeat(innerWidth) + corner + '\n';
        rectangle += (verticalBorder + fill.repeat(innerWidth) + verticalBorder + '\n').repeat(innerHeight);
        rectangle += corner + horizontalBorder.repeat(innerWidth) + corner + '\n';

        return rectangle;
    }
    let height = 0;
    let widths = [];

    figure = figure.split('\n');
    for (const line of figure) {
        height += 1;
        if (line.includes('+')) {
            for (const width of widths) yield buildRectangle(width + 2, height);

            height = 1;
            widths = [];
        }
        widths = line.split(/\+|\|/).slice(1, -1).map((innerWidth) => innerWidth.length);
    }
}


module.exports = {
    parseBankAccount : parseBankAccount,
    wrapText: wrapText,
    PokerRank: PokerRank,
    getPokerHandRank: getPokerHandRank,
    getFigureRectangles: getFigureRectangles
};
