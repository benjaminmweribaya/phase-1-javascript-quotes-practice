document.addEventListener("DOMContentLoaded", () => {
    const quoteList = document.getElementById("quote-list");
    const newQuoteForm = document.getElementById("new-quote-form");
    const sortButton = document.createElement("button");
    sortButton.textContent = "Sort by Author";
    sortButton.className = "btn btn-secondary";
    document.body.insertBefore(sortButton, quoteList);

    let sortedByAuthor = false;

    // Fetch and display all quotes
    function fetchQuotes() {
        fetch("http://localhost:3000/quotes?_embed=likes")
            .then(response => response.json())
            .then(quotes => renderQuotes(quotes))
            .catch(error => console.error("Error fetching quotes:", error));
    }

    // Render the list of quotes
    function renderQuotes(quotes) {
        quoteList.innerHTML = "";
        quotes.forEach(quote => {
            const quoteElement = createQuoteElement(quote);
            quoteList.appendChild(quoteElement);
        });
    }

    // Create a quote card element
    function createQuoteElement(quote) {
        const li = document.createElement("li");
        li.className = "quote-card";
        li.innerHTML = `
        <blockquote class="blockquote">
          <p class="mb-0">${quote.quote}</p>
          <footer class="blockquote-footer">${quote.author}</footer>
          <br>
          <button class='btn-success'>Likes: <span>${quote.likes ? quote.likes.length : 0}</span></button>
          <button class='btn-danger'>Delete</button>
        </blockquote>
      `;

        // Add event listeners for like and delete buttons
        const likeButton = li.querySelector(".btn-success");
        const deleteButton = li.querySelector(".btn-danger");

        likeButton.addEventListener("click", () => handleLike(quote, li));
        deleteButton.addEventListener("click", () => handleDelete(quote, li));

        return li;
    }

    // Handle the like functionality
    function handleLike(quote, quoteElement) {
        const likeData = {
            quoteId: quote.id,
            createdAt: Math.floor(Date.now() / 1000),
        };

        fetch("http://localhost:3000/likes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(likeData),
        })
            .then(response => response.json())
            .then(() => {
                const likesSpan = quoteElement.querySelector("span");
                likesSpan.textContent = parseInt(likesSpan.textContent) + 1;
            })
            .catch(error => console.error("Error liking quote:", error));
    }

    // Handle the delete functionality
    function handleDelete(quote, quoteElement) {
        fetch(`http://localhost:3000/quotes/${quote.id}`, {
            method: "DELETE",
        })
            .then(() => {
                quoteElement.remove();
            })
            .catch(error => console.error("Error deleting quote:", error));
    }

    // Handle the edit functionality
    function handleEdit(quote, editForm) {
        const updatedQuote = editForm.quote.value;
        const updatedAuthor = editForm.author.value;

        fetch(`http://localhost:3000/quotes/${quote.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ quote: updatedQuote, author: updatedAuthor }),
        })
            .then(response => response.json())
            .then(updatedQuote => {
                renderQuotes([updatedQuote]);
                editForm.style.display = "none"; // Hide the edit form after saving
            })
            .catch(error => console.error("Error editing quote:", error));
    }

    // Handle new quote submission
    newQuoteForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const newQuote = document.getElementById("new-quote").value;
        const author = document.getElementById("author").value;

        const quoteData = {
            quote: newQuote,
            author: author,
        };

        fetch("http://localhost:3000/quotes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(quoteData),
        })
            .then(response => response.json())
            .then(newQuote => {
                fetchQuotes(); // Refreshes the list with the new quote included
                const quoteElement = createQuoteElement(newQuote);
                quoteList.appendChild(quoteElement);
                newQuoteForm.reset();
            })
            .catch(error => console.error("Error adding new quote:", error));
    });

    // Sort quotes by author name
    sortButton.addEventListener("click", () => {
        sortedByAuthor = !sortedByAuthor;
        sortButton.textContent = sortedByAuthor ? "Sort by ID" : "Sort by Author";
        fetchQuotes();
    });

    // Initial fetch of quotes when page loads
    fetchQuotes();
});
