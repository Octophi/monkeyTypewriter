import os
import string

def clean_words(input_file, output_file):
    # Initialize list to hold cleaned words
    cleaned_words = []
    seen_words = set()
    total_valid_words = 0

    with open(input_file, 'r') as infile:
        for line in infile:
            line = line.strip()
            if not line:
                continue

            # Remove lines with multiple words (more than one word in line)
            if len(line.split()) != 1:
                continue

            word = line

            # Filter 1: only allow alphabetic words (no symbols or numbers)
            if not word.isalpha():
                continue

            # Filter: only allow ASCII letters
            if any(char not in string.ascii_letters for char in word):
                continue

            # Filter 3: remove single-letter words
            if len(word) == 1:
                continue

            # Filter 4: remove duplicate words (case-sensitive)
            if word in seen_words:
                continue

            seen_words.add(word)
            cleaned_words.append(word)
            total_valid_words += 1

    # Remove duplicates at the end (case-insensitive) and sort
    unique_cleaned_words = sorted({word.lower() for word in cleaned_words})
    # Write all unique cleaned words to a single file
    with open(output_file, 'w') as f:
        f.write('\n'.join(unique_cleaned_words))
    print(f"Wrote {len(unique_cleaned_words)} words to {output_file}")

# Example usage
clean_words('words.txt', 'cleaned_words.txt')
