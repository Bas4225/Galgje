var alphabet = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

//load graph data
google.charts.load('current', {'packages':['corechart']});
dataFromBot = [];
dataFromDummybot = [];
let drawGraphs = 0;
var wonStat = 0;
//IMPORT NEW ARRAY
var wordList = [];
var totalLetters = 0;
let aantalGewonnenDummybot = 0;
let aantalGewonnenBot = 0;

// sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getWords(file) {
    var rawFile = new XMLHttpRequest();
    rawFile.open('GET', file, false);
    rawFile.onreadystatechange = function () {
        if(rawFile.readyState === 4) {
            if(rawFile.status === 200 || rawFile.status == 0) {
                wordList = rawFile.responseText.split('\r\n');
            }
        }
    };
    rawFile.send(null);
}

getWords('./words.txt');

var toGuess = wordList[Math.floor(Math.random() * wordList.length)].toUpperCase();
console.log("toGuess: " + toGuess);

toGuess = toGuess.split(''); //Make toGuess an array

var guesses = 6;
var gameOver = false;

var equal = false; //Used later on to check if toGuess and guessedWord are equal

var characters = document.getElementById("toGuess"); //Div where you see how much characters the word is and what letters you guessed

var guessedWord = []; //Gets filled in if you pick a right letter

for (let i = 0; i < toGuess.length; i++) {
    characters.innerHTML += "_ "; //Print the length of toGuess represented by _'s
    guessedWord.push("_"); //Make guessedWord the same length as toGuess
}

var rightCharacters = [];
var wrongCharacters = [];

var notChosen = [];
for (i = 0; i < alphabet.length; i++){
    notChosen.push(alphabet[i]);
}

var wordIsGuessed = false;

var wordCount = 0;
var avgWordCount = [];

function getInput(letter){
    wordCount++;
    totalLetters++;
    if (!gameOver){
        //console.log("Input: " + letter);

        document.getElementById(letter).disabled = true; //Can't press the button anymore
        var index = notChosen.indexOf(letter);
        notChosen.splice(index, 1);

        if(toGuess.indexOf(letter) != -1){ //Correct letter

            rightCharacters.push(letter);

            for (let i = 0; i < guessedWord.length; i++) {
                if (letter == toGuess[i]){
                    guessedWord[i] = letter; //Fill in guessedWord
                }
            }
        }
        else{ //Wrong letter
            wrongCharacters.push(letter);

            guesses -= 1;
            document.getElementById("guessesDiv").innerHTML = `Remaining guesses: ${guesses}`;
            document.getElementById('image').src = `Hangman png's/hangman${guesses}.png`;
        }

        if(guesses <= 0){ //Loss condition
            toGuess = toGuess.join("");
            document.getElementById("guessesDiv").innerHTML = `Game Over... The word was ${toGuess}`;
            wordCount = 0;
            gameOver = true;
        }

        characters.innerHTML = '';
        for (let i = 0; i < guessedWord.length; i++) { //Print guessedWord to screen
            characters.innerHTML += (guessedWord[i] + ' ');
        }

        for (let i = 0; i < toGuess.length; i++) { //Checks if guessedWord == toGuess
            if (toGuess[i] != guessedWord[i]){
                equal = false;
                break;
            }else{
                equal = true;
            }
        }

        if (equal == true){ //Win condition
            //console.log("You guessed the right word!");
            gameOver = true;
            wordIsGuessed = true;
            document.getElementById("guessesDiv").innerHTML = `Good job!! Remaining guesses: ${guesses}`;
            document.getElementById('image').src = `Hangman png's/hangmanWin.png`;

            wonStat++;
            avgWordCount.push(wordCount);
            wordCount = 0;

        }
    }
}

function reset(){
    toGuess = wordList[Math.floor(Math.random() * wordList.length)].toUpperCase(); //Pick a random word from the array
    console.log("toGuess: " + toGuess);

    toGuess = toGuess.split(''); //Make toGuess an array

    guesses = 6;
    document.getElementById("guessesDiv").innerHTML = `Remaining guesses: ${guesses}`;
    gameOver = false;

    guessedWord = []; //Gets filled in if you pick a right letter

    characters.innerHTML = '';

    for (let i = 0; i < toGuess.length; i++) {
        guessedWord.push("_"); //Make guessedWord the same length as toGuess
        characters.innerHTML += (guessedWord[i] + ' ');
    }

    //Reset the buttons:
    for (let i = 0; i < alphabet.length; i++) {
        document.getElementById(alphabet[i]).disabled = false;
    }

    //Reset the image:
    document.getElementById('image').src = `Hangman png's/hangman6.png`;

    rightCharacters = [];
    wrongCharacters = [];
    notChosen = [];

    for (i = 0; i < alphabet.length; i++){
        notChosen.push(alphabet[i]);
    }

    wordIsGuessed = false;
}


//Allow keyboard input:
document.addEventListener('keydown', function(event) {
    var pressedKey = String.fromCharCode(event.keyCode).toUpperCase()

    if(document.getElementById(pressedKey)){

        if(document.getElementById(pressedKey).disabled == false){
            getInput(pressedKey);
        }
    }
});


//Functions for bots:

//Get all the words with the right length:
function checkLengths(){
    var possibleMatches = [];

    for (let i = 0; i < wordList.length; i++){
        if (wordList[i].length == toGuess.length){
            possibleMatches.push(wordList[i]);
        }
    }

    return possibleMatches;
}

//Get the most common character, is given an array to calculate it from and an array of characters
//which haven't been chosen (because you don't want to return a character that is already chosen)
function getCommon(words, notChosenCharacters){

    var wordString = words.join('');
    var length = notChosenCharacters.length;
    var characterFrequencies = [length];

    for (let i = 0; i < notChosenCharacters.length; i++){
        var myRegex = notChosenCharacters[i].toLowerCase();
        var regex = new RegExp(myRegex, 'g');
        var matches = wordString.match(regex);
        if (matches == null){
            characterFrequencies[i] = 0;
        }
        else{
            characterFrequencies[i] = matches.length;
        }
    }

    var highest = 0;
    var myIndex = 0;

    for (let i = 0; i < characterFrequencies.length; i++){
        if (characterFrequencies[i] > highest ){
            highest = characterFrequencies[i];
            myIndex = i;
        }
    }

    return notChosenCharacters[myIndex];
}

//This function removes words from an array if they contain the wrong characters:
function removeWrong(wrongCharacters, possibleMatches){ //WORKS

    //Make the regex:
    var myRegex = '[^';

    for (let i = 0; i < wrongCharacters.length; i++){
        myRegex += wrongCharacters[i].toLowerCase();
    }

    myRegex += `]{${toGuess.length}}`;

    var regex = new RegExp(myRegex);
    var newMatches = possibleMatches.filter(val => regex.test(val));

    return newMatches;
}

//This function makes an array from the correctly chosen array and checks for the matches in a given array
function checkCorrect(guessedWord, possibleMatches){
//(guessedWord is an array with the correctly chosen letters in the right spots, if not chosen there is a '_')

    //Make the regex:
    var myRegex = '';
    for (i = 0; i < guessedWord.length; i++){
        if (guessedWord[i] != '_'){
            myRegex += guessedWord[i].toLowerCase();
        }
        else{
            myRegex += '.';
        }
    }

    var regex = new RegExp(myRegex);
    var newMatches = possibleMatches.filter(val => regex.test(val));

    return newMatches;

}

//This function is the 'bot', which keeps track of the variables and uses all of the previous functions to make choices
async function bot() {

    var runs = document.getElementById("runsInput").value;
    console.log("runs: ", runs);
    var possibleMatches = checkLengths();
    var outcome = 0;

    var now = new Date();
    var before = now.getTime();

    // data for the graph
    let data = [];
    let rij = [];
    // Only tracks total correct ( only used when both are called )
    let dataMain = [];

    rij = [0, 0]
    let kolommen = ['aantal woorden', 'Mark'];
    data.push(kolommen);
    data.push(rij);

    for (let i = 0; i < runs; i++){
        while(!gameOver){
            if (wrongCharacters.length > 0){
                possibleMatches = removeWrong(wrongCharacters, possibleMatches);
            }
            if (rightCharacters.length > 0){
                possibleMatches = checkCorrect(guessedWord, possibleMatches);
            }

            var choice = getCommon(possibleMatches, notChosen);
            getInput(choice);
            await pauzeren(0.000);
        }
        //Game Over
        if (wordIsGuessed){
            outcome++;
            aantalGewonnenBot++;
        }

        reset();
        possibleMatches = checkLengths();

        // Insert data from bot into data for graph
        rij = [];
        rij.push(i+1);
        rij.push(aantalGewonnenBot);
        data.push(rij);
        // Used for when Both is triggered
        dataMain.push([aantalGewonnenBot]);

        // Updates graph
      if (drawGraphs == 0){
            plotGrafiek(data);
        }
    }

    var average = (outcome / runs) * 100;

    now = new Date();
    var after = now.getTime();
    var calcTime = (after - before) / 1000;

    document.getElementById("timeStat").innerHTML = `Time: ${calcTime}s`;
    document.getElementById("wonStat").innerHTML = `Wins: ${wonStat}`;
    document.getElementById("lostStat").innerHTML = `Losses: ${runs - wonStat}`;
    document.getElementById("totalGuessedLettersStat").innerHTML = `Total letters: ${totalLetters}`;
    wonStat = 0;
    totalLetters = 0;
    document.getElementById("averageWordsRightStat").innerHTML = `Average: ${average}%`;

    if (avgWordCount.length > 0){
        var count = 0;
        for (i = 0; i < avgWordCount.length; i++){
            count += avgWordCount[i];
        }

        count = count / avgWordCount.length;
        document.getElementById("averageLetterGoodWordStat").innerHTML = `Avg letters/good word: ${count.toFixed(1)}`;
        var bestGuess = avgWordCount.reduce((a, b) => Math.min(a, b));
        document.getElementById("minGuessStat").innerHTML = `Best guess: ${bestGuess}`;
        var worstGuess = Math.max(...avgWordCount);
        document.getElementById("maxGuessStat").innerHTML = `Worst guess: ${worstGuess}`;
    }
    else{
        document.getElementById("averageLetterGoodWordStat").innerHTML = `Avg letters/good word: -`;
        document.getElementById("minGuessStat").innerHTML = `Best guess: -`;
        document.getElementById("maxGuessStat").innerHTML = `Worst guess: -`;
    }

    console.log("Time: " + calcTime + "s");
    console.log('Average: ' + average + "%");
    //Calculate percentage

    // draw graph
    dataFromBot = dataMain;
    aantalGewonnenBot = 0;
    avgWordCount = [];
}

function pauzeren(seconden) {
  return new Promise(resolve => setTimeout(resolve, seconden * 1000 * 0));
}

async function dummybot(){
    var runs = document.getElementById("runsInput").value;
    var outcome = 0;
    console.log("runs: ", runs);

    var now = new Date();
    var before = now.getTime();

    //  data for the graph
    let data = [];
    let rij = [];
    // Only tracks total correct
    let dataMain = [];

    rij = [0, 0]
    let kolommen = ['aantal woorden', 'Dummy bot (random)'];
    data.push(kolommen);
    data.push(rij);

    for (let i = 0; i < runs; i++){
        while(!gameOver){
            var choice = alphabet[Math.floor(Math.random() * alphabet.length)].toUpperCase();
            getInput(choice);
            await pauzeren(0.000);
        }

        //Game Over
        if (wordIsGuessed){
            outcome++;
            aantalGewonnenDummybot++;
        }
        reset();

        // Insert data from bot into array
        rij = [];
        rij.push(i+1);
        rij.push(aantalGewonnenDummybot);
        data.push(rij);

        // Only insert how many are correct into other array
        dataMain.push([aantalGewonnenDummybot]);
        if (drawGraphs == 0){
            plotGrafiek(data);
        }
    }

    var average = (outcome / runs) * 100;

    now = new Date();
    var after = now.getTime();
    var calcTime = (after - before) / 1000;

    document.getElementById("timeStat").innerHTML = `Time: ${calcTime}s`;
    document.getElementById("wonStat").innerHTML = `Wins: ${wonStat}`;
    document.getElementById("lostStat").innerHTML = `Losses: ${runs - wonStat}`;
    document.getElementById("totalGuessedLettersStat").innerHTML = `Total letters: ${totalLetters}`;
    wonStat = 0;
    totalLetters = 0;
    document.getElementById("averageWordsRightStat").innerHTML = `Average: ${average}%`;

    if (avgWordCount.length > 0){
        var count = 0;
        for (i = 0; i < avgWordCount.length; i++){
            count += avgWordCount[i];
        }

        count = count / avgWordCount.length;
        document.getElementById("averageLetterGoodWordStat").innerHTML = `Avg letters/good word: ${count.toFixed(1)}`;
        var bestGuess = avgWordCount.reduce((a, b) => Math.min(a, b));
        document.getElementById("minGuessStat").innerHTML = `Best guess: ${bestGuess}`;
        var worstGuess = Math.max(...avgWordCount);
        document.getElementById("maxGuessStat").innerHTML = `Worst guess: ${worstGuess}`;
    }
    else{
        document.getElementById("averageLetterGoodWordStat").innerHTML = `Avg letters/good word: -`;
        document.getElementById("minGuessStat").innerHTML = `Best guess: -`;
        document.getElementById("maxGuessStat").innerHTML = `Worst guess: -`;
    }

    console.log("Time: " + calcTime + "s");
    console.log('Average: ' + average + "%");
    //Calculate percentage

    // draw graph
    dataFromDummybot = dataMain;
    aantalGewonnenDummybot = 0;
    avgWordCount = [];

}

function callBothNeeded(){
  bot();
  dummybot();
}

async function callBoth(){

    drawGraphs = 1;
    
    var runs = document.getElementById("runsInput").value;

    await bot();
    await dummybot();
  
    console.log(dataFromBot);
    console.log(dataFromDummybot);
  

    let dataFromBoth = [];
    let rij = [];

    for (let i = 0; i < runs; i++){
        if (i === 0){
            dataFromBoth.push(['number of runs completed', 'Mark', 'Dummy']);
        }

        rij = [];
        rij.push(i+1);
        rij.push(parseInt(dataFromBot[i]));
        rij.push(parseInt(dataFromDummybot[i]));
        dataFromBoth.push(rij);
        plotGrafiek(dataFromBoth);
        await sleep(0.0001);
    }

    aantalGewonnenDummybot = 0, drawGraphs = 0, aantalGewonnenBot = 0;


}

function plotGrafiek(data){

    let dataTable = google.visualization.arrayToDataTable(data);
    let options = {
        title: 'Y: Correct, X: Runs',
        legend: { position: 'bottom' }
    };
    let chart = new google.visualization.LineChart(document.getElementById('curve_chart'));

    chart.draw(dataTable, options);
  
}