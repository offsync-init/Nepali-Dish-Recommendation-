from nltk import PorterStemmer
import re
from nltk.corpus import stopwords
from nltk import word_tokenize

def Clean_Description(text):
    stemmer = PorterStemmer()
    stop_words = stopwords.words('english')
    text = re.sub(r'[^\w\s]', '', text)
    text = " ".join([stemmer.stem(words.lower()) for words in word_tokenize(text) if words not in stop_words and len(words) > 2])
    return text