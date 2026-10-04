```javascript
// ---------------------------------------
// PDF Question Answering
// ---------------------------------------

const pdfInput =
    document.getElementById("pdfInput");

const fileInfo =
    document.getElementById("fileInfo");

const fileName =
    document.getElementById("fileName");

const pageInfo =
    document.getElementById("pageInfo");

const textSection =
    document.getElementById("textSection");

const textPreview =
    document.getElementById("textPreview");

const questionSection =
    document.getElementById("questionSection");

const question =
    document.getElementById("question");

const askBtn =
    document.getElementById("askBtn");

const loading =
    document.getElementById("loading");

const loadingText =
    document.getElementById("loadingText");

const answerBox =
    document.getElementById("answerBox");

const answer =
    document.getElementById("answer");

const errorBox =
    document.getElementById("errorBox");


let pdfText = "";


// ---------------------------------------
// Configure PDF.js
// ---------------------------------------

pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";


// ---------------------------------------
// Upload PDF
// ---------------------------------------

pdfInput.addEventListener(
    "change",
    async function () {

        const file = this.files[0];

        if (!file) {
            return;
        }


        if (file.type !== "application/pdf") {

            showError(
                "Please select a valid PDF file."
            );

            return;
        }


        hideError();

        answerBox.classList.add("hidden");

        fileName.textContent =
            file.name;

        fileInfo.classList.remove(
            "hidden"
        );

        loading.classList.remove(
            "hidden"
        );

        loadingText.textContent =
            "Reading PDF...";


        try {

            const arrayBuffer =
                await file.arrayBuffer();


            const pdf =
                await pdfjsLib.getDocument({
                    data: arrayBuffer
                }).promise;


            pageInfo.textContent =
                pdf.numPages +
                " page(s) detected";


            pdfText = "";


            // Read every page

            for (
                let pageNumber = 1;
                pageNumber <= pdf.numPages;
                pageNumber++
            ) {

                loadingText.textContent =
                    "Reading page " +
                    pageNumber +
                    " of " +
                    pdf.numPages +
                    "...";


                const page =
                    await pdf.getPage(
                        pageNumber
                    );


                const content =
                    await page.getTextContent();


                const pageText =
                    content.items
                        .map(
                            item =>
                                item.str
                        )
                        .join(" ");


                pdfText +=
                    pageText + "\n\n";
            }


            pdfText =
                pdfText.trim();


            if (!pdfText) {

                throw new Error(
                    "No selectable text was found in this PDF."
                );
            }


            // Show preview

            textPreview.textContent =
                pdfText.substring(
                    0,
                    5000
                );


            textSection.classList.remove(
                "hidden"
            );


            questionSection.classList.remove(
                "hidden"
            );


        } catch (error) {

            console.error(error);

            showError(
                "Could not read this PDF. " +
                "Make sure it contains selectable text."
            );

        } finally {

            loading.classList.add(
                "hidden"
            );
        }

    }
);


// ---------------------------------------
// Ask question
// ---------------------------------------

askBtn.addEventListener(
    "click",
    function () {

        const userQuestion =
            question.value.trim();


        if (!pdfText) {

            showError(
                "Please upload a PDF first."
            );

            return;
        }


        if (!userQuestion) {

            showError(
                "Please enter a question."
            );

            return;
        }


        hideError();

        answerBox.classList.add(
            "hidden"
        );

        loading.classList.remove(
            "hidden"
        );

        loadingText.textContent =
            "Searching the PDF...";


        // Give browser time to update UI

        setTimeout(
            function () {

                const result =
                    findAnswer(
                        userQuestion,
                        pdfText
                    );


                answer.textContent =
                    result;


                answerBox.classList.remove(
                    "hidden"
                );


                loading.classList.add(
                    "hidden"
                );

            },
            500
        );

    }
);


// ---------------------------------------
// Simple question answering
// ---------------------------------------

function findAnswer(
    question,
    documentText
) {

    const sentences =
        documentText
            .replace(/\s+/g, " ")
            .split(
                /(?<=[.!?])\s+/
            );


    const questionWords =
        cleanWords(question);


    let bestSentence = "";

    let bestScore = 0;


    for (
        const sentence of sentences
    ) {

        const sentenceWords =
            cleanWords(sentence);


        let score = 0;


        for (
            const word of questionWords
        ) {

            if (
                sentenceWords.includes(
                    word
                )
            ) {

                score++;
            }
        }


        if (score > bestScore) {

            bestScore = score;

            bestSentence =
                sentence;
        }

    }


    if (bestScore === 0) {

        return (
            "I could not find a direct answer " +
            "to that question in the uploaded PDF."
        );
    }


    return bestSentence.trim();
}


// ---------------------------------------
// Clean words
// ---------------------------------------

function cleanWords(text) {

    const stopWords = new Set([
        "what",
        "where",
        "when",
        "which",
        "who",
        "why",
        "how",
        "is",
        "are",
        "was",
        "were",
        "the",
        "a",
        "an",
        "of",
        "in",
        "on",
        "to",
        "for",
        "and",
        "or",
        "this",
        "that",
        "about",
        "does",
        "do"
    ]);


    return text
        .toLowerCase()
        .replace(
            /[^a-z0-9\s]/g,
            ""
        )
        .split(/\s+/)
        .filter(
            word =>
                word.length > 2 &&
                !stopWords.has(word)
        );
}


// ---------------------------------------
// Error handling
// ---------------------------------------

function showError(message) {

    errorBox.textContent =
        message;

    errorBox.classList.remove(
        "hidden"
    );
}


function hideError() {

    errorBox.classList.add(
        "hidden"
    );
}
```
