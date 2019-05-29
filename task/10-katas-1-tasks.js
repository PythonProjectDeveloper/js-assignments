'use strict';

/**
 * Returns the array of 32 compass points and heading.
 * See details here:
 * https://en.wikipedia.org/wiki/Points_of_the_compass#32_cardinal_points
 *
 * @return {array}
 *
 * Example of return :
 *  [
 *     { abbreviation : 'N',     azimuth : 0.00 ,
 *     { abbreviation : 'NbE',   azimuth : 11.25 },
 *     { abbreviation : 'NNE',   azimuth : 22.50 },
 *       ...
 *     { abbreviation : 'NbW',   azimuth : 348.75 }
 *  ]
 */
function createCompassPoints() {
    const sides = ['N','E','S','W'];  // use array of cardinal directions only!
    const getCommonPoint = (mainPoint, secondaryPoint) => `${mainPoint}${secondaryPoint}`;
    const getSmallPoint = (mainPoint, secondaryPoint) => `${mainPoint}b${secondaryPoint.replace(new RegExp(mainPoint, 'g'), '')}`;
    const getDirection = (points, startIdx, endIdx, getPoint) => {
        const start = points[startIdx];
        const end = points[endIdx % points.length];
        const newPoint = startIdx % 2 ? getPoint(end, start) : getPoint(start, end);

        return newPoint;
    };
    const addPoints = (points, getPoint) => {
        return points.reduce((acc, dir, idx) => acc.concat(dir, getDirection(points, idx, idx + 1, getPoint)), []);
    }
    const secondPointLevel = addPoints(sides, getCommonPoint);
    const thirdPointLevel = addPoints(secondPointLevel, getCommonPoint);
    const fourthPointLevel = addPoints(thirdPointLevel, getSmallPoint);
    const compassPoints = fourthPointLevel.map((point, idx) => ({ abbreviation : point,   azimuth : idx * 11.250 }))

    return compassPoints;
}


/**
 * Expand the braces of the specified string.
 * See https://en.wikipedia.org/wiki/Bash_(Unix_shell)#Brace_expansion
 *
 * In the input string, balanced pairs of braces containing comma-separated substrings
 * represent alternations that specify multiple alternatives which are to appear at that position in the output.
 *
 * @param {string} str
 * @return {Iterable.<string>}
 *
 * NOTE: The order of output string does not matter.
 *
 * Example:
 *   '~/{Downloads,Pictures}/*.{jpg,gif,png}'  => '~/Downloads/*.jpg',
 *                                                '~/Downloads/*.gif'
 *                                                '~/Downloads/*.png',
 *                                                '~/Pictures/*.jpg',
 *                                                '~/Pictures/*.gif',
 *                                                '~/Pictures/*.png'
 *
 *   'It{{em,alic}iz,erat}e{d,}, please.'  => 'Itemized, please.',
 *                                            'Itemize, please.',
 *                                            'Italicized, please.',
 *                                            'Italicize, please.',
 *                                            'Iterated, please.',
 *                                            'Iterate, please.'
 *
 *   'thumbnail.{png,jp{e,}g}'  => 'thumbnail.png'
 *                                 'thumbnail.jpeg'
 *                                 'thumbnail.jpg'
 *
 *   'nothing to do' => 'nothing to do'
 */
function* expandBraces(str) {
    const PATTERN = new RegExp('({[^{}]*})');
    const CASH = {};
    const getMatch = (pattern, str) => {
        const match = pattern.exec(str);
        return match ? match[0] : match;
    };
    const openBracket = (bracket) => {
        if (bracket in CASH) return CASH[bracket];
        const result = bracket.slice(1, -1).split(',');
        CASH[bracket] = result;
        return result;
    };
    const combine = (line, template, args) => args.map((arg) => line.replace(template, arg));
    const replaceBracket = (line) => {
        const bracket = getMatch(PATTERN, line);
        if (!bracket) return [line];

        const args = openBracket(bracket);
        const combinations = combine(line, bracket, args);

        return combinations;
    };
    const findBracets = (str) => {
        let combinations = [str];
        let flag = true;
        while(flag) {
            combinations = combinations.map((comb) => replaceBracket(comb));
            flag = combinations.every((comb) => comb.length !== 1);
            combinations = combinations.reduce((acc, comb) => acc.concat(...comb), []); // combinations = combinations.flat();
        }

        return combinations;
    };
    
    yield* new Set(findBracets(str));
}


/**
 * Returns the ZigZag matrix
 *
 * The fundamental idea in the JPEG compression algorithm is to sort coefficient of given image by zigzag path and encode it.
 * In this task you are asked to implement a simple method to create a zigzag square matrix.
 * See details at https://en.wikipedia.org/wiki/JPEG#Entropy_coding
 * and zigzag path here: https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/JPEG_ZigZag.svg/220px-JPEG_ZigZag.svg.png
 *
 * @param {number} n - matrix dimension
 * @return {array}  n x n array of zigzag path
 *
 * @example
 *   1  => [[0]]
 *
 *   2  => [[ 0, 1 ],
 *          [ 2, 3 ]]
 *
 *         [[ 0, 1, 5 ],
 *   3  =>  [ 2, 4, 6 ],
 *          [ 3, 7, 8 ]]
 *
 *         [[ 0, 1, 5, 6 ],
 *   4 =>   [ 2, 4, 7,12 ],
 *          [ 3, 8,11,13 ],
 *          [ 9,10,14,15 ]]
 *
 */
function getZigZagMatrix(n) {
    const zigZagMatrix = Array.from( Array(n) ).map(x => Array.from( Array(n) ).map(y => 0)); 
 
    let step = 1;
    let diagonalLength = 0;
    let counter = -1;
    const diagonals = [];
    for (let i = 0, end = n + n - 1; i < end; i++) {
        if (i === n) step = -1;
        diagonalLength += step;
        const diagonal = Array.from(Array(diagonalLength), () => counter += 1);
        diagonals.push(diagonal);
    }

    for (let i = 0; i < n; i++) { 
        for (let j = 0; j < n; j++) {
            const diagonal = diagonals[i + j];
            zigZagMatrix[i][j] = (i + j) % 2 ? diagonal.shift() : diagonal.pop();
        } 
    } 

    return zigZagMatrix;
}


/**
 * Returns true if specified subset of dominoes can be placed in a row accroding to the game rules.
 * Dominoes details see at: https://en.wikipedia.org/wiki/Dominoes
 *
 * Each domino tile presented as an array [x,y] of tile value.
 * For example, the subset [1, 1], [2, 2], [1, 2] can be arranged in a row (as [1, 1] followed by [1, 2] followed by [2, 2]),
 * while the subset [1, 1], [0, 3], [1, 4] can not be arranged in one row.
 * NOTE that as in usual dominoes playing any pair [i, j] can also be treated as [j, i].
 *
 * @params {array} dominoes
 * @return {bool}
 *
 * @example
 *
 * [[0,1],  [1,1]] => true
 * [[1,1], [2,2], [1,5], [5,6], [6,3]] => false
 * [[1,3], [2,3], [1,4], [2,4], [1,5], [2,5]]  => true
 * [[0,0], [0,1], [1,1], [0,2], [1,2], [2,2], [0,3], [1,3], [2,3], [3,3]] => false
 *
 */
function canDominoesMakeRow(dominoes) {
    const addMove = (row, domino, count) => {
        row[domino] = row[domino] ? row[domino] + count : count;
    };
    const gameRow = [];
    dominoes.forEach((domino) => {
        const leftSide = domino[0];
        const rightSide = domino[1];
        let shift = (leftSide === rightSide) ? -1 : 1;
        addMove(gameRow, leftSide, shift);
        addMove(gameRow, rightSide, shift);
    });
    
    const nonPairSide = gameRow.reduce((acc, val) => val < 0 || val % 2 ? acc + 1 : acc, 0);
    return nonPairSide < 3;
}


/**
 * Returns the string expression of the specified ordered list of integers.
 *
 * A format for expressing an ordered list of integers is to use a comma separated list of either:
 *   - individual integers
 *   - or a range of integers denoted by the starting integer separated from the end integer in the range by a dash, '-'.
 *     (The range includes all integers in the interval including both endpoints)
 *     The range syntax is to be used only for, and for every range that expands to more than two values.
 *
 * @params {array} nums
 * @return {bool}
 *
 * @example
 *
 * [ 0, 1, 2, 3, 4, 5 ]   => '0-5'
 * [ 1, 4, 5 ]            => '1,4,5'
 * [ 0, 1, 2, 5, 7, 8, 9] => '0-2,5,7-9'
 * [ 1, 2, 4, 5]          => '1,2,4,5'
 */
function extractRanges(nums) {
    nums.push(Infinity);
    const ranges = [];
    const toString = (arr) => arr.length > 2 ? `${arr.shift()}-${arr.pop()}` : `${arr.join()}`;
    let startIndex = 0;

    nums.reduce((acc, value, endIndex) => {
        if (acc + 1 < value) {
            const group = nums.slice(startIndex, endIndex); 
            ranges.push(group);
            startIndex = endIndex;
        }

        return value;
    });

    return ranges.map(toString).join();
}

module.exports = {
    createCompassPoints : createCompassPoints,
    expandBraces : expandBraces,
    getZigZagMatrix : getZigZagMatrix,
    canDominoesMakeRow : canDominoesMakeRow,
    extractRanges : extractRanges
};
