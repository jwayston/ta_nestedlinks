# Nested outgoing links outline expander plugin for [The Archive](https://zettelkasten.de/the-archive/)

Expands and nests outgoing links for the link detected in a selection. Iterates until the given depth is reached.

Link descriptions are derived from the filenames. If the filename consists of just a UID, the first detected H1 header will be used.

**Example usage**

Selected text:
```
The motivator for making a change can be pain or creativity [[250215S8]]
```

Output:
```
- The motivator for making a change can be pain or creativity [[250215S8]]
  - Is the pursuit of order a sign of a need for control or a desire for aesthetic pleasure? [[250128I2]]
    - Art is the transformation of entropy into order [[250128IL]]
    - It would be more natural for humanity to accept disorder than to strive for artificial order [[25020600]]
  - The therapeutic examination of suffering is determined by the type of suffering [[240224L5]]
    - Associating evil with suffering can leave a person responsible for their own suffering [[250129NY]]

```

## Caveats

- Duplicate skipping is hardcoded. I.e. only first occurrence of a link is included in the result.

## Possible issues

Since my Zettelkasten uses single custom UIDs as filenames, only basic testing was done for traditional "DATETIMEUID File description" style filenames. Feel free to open an issue in case of problems. 

