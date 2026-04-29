import re
import nltk
from nltk import PorterStemmer
from nltk import word_tokenize
from nltk.corpus import stopwords


def _ensure_nltk_resources():
    """Ensure required NLTK data is present in deployment environments."""
    resources = [
        ("tokenizers/punkt", "punkt"),
        ("tokenizers/punkt_tab", "punkt_tab"),
        ("corpora/stopwords", "stopwords"),
    ]

    for data_path, package in resources:
        try:
            nltk.data.find(data_path)
        except LookupError:
            nltk.download(package, quiet=True)


_ensure_nltk_resources()

def Clean_Description(text):
    stemmer = PorterStemmer()
    stop_words = stopwords.words('english')
    text = re.sub(r'[^\w\s]', '', text)
    text = " ".join([stemmer.stem(words.lower()) for words in word_tokenize(text) if words not in stop_words and len(words) > 2])
    return text