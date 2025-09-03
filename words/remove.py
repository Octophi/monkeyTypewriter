import os
import string

def split_words_by_first_letter(input_file, output_dir):
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)

    # Initialize dictionary to hold words for each letter
    letter_buckets = {letter: [] for letter in string.ascii_lowercase}
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

            # Filter 3: remove single-letter words
            if len(word) == 1:
                continue

            # Filter 4: remove duplicate words (case-sensitive)
            if word in seen_words:
                continue

            seen_words.add(word)

            # Assign word to bucket based on first letter (lowercased)
            first_char = word[0].lower()
            if first_char in letter_buckets:
                letter_buckets[first_char].append(word)
                total_valid_words += 1

    # Write filtered words to separate files
    for letter, words in letter_buckets.items():
        if words:
            filepath = os.path.join(output_dir, f"{letter}.txt")
            with open(filepath, 'w') as f:
                f.write('\n'.join(words))
            print(f"Wrote {len(words)} words to {filepath}")

    print(f"\nTotal valid words written: {total_valid_words}")

# Example usage
split_words_by_first_letter('words.txt', 'letters')
