# Typography and Copy

## General

End sentences with a period. Even short ones. Button and form labels do not end in periods, and neither to headings.

Use curly quotes and apostrophes.
e.g. “like this” instead of "like this"
e.g. it’s instead of it's

## Capitalization

Rule of thumb: use sentence case for almost everything.

Button labels, modal titles, and form labels; they all use sentence case.

## Snackbars

When a network request completes it will often pop up a “snackbar” notification. The copy in these notifications should be informative.

When the setting is/or behaves like a feature toggle (like SSH access, Defensive mode) let’s use:

> {Setting name} enabled.
> {Setting name} disabled.

When it’s not a toggle let’s use:

> {Setting name} saved.

When it is being deleted:

> {Setting name} deleted.

There will be exceptions, such as when the setting can't be changed instantly, but we still want to show success to the user:

> Change of domain ownership requested.

But note that the setting name is still used, and the message ends with the past-tense verb.

Error message should be helpful where possible, although it is not always possible. The message should begin with “Failed”:

> Failed to enable {setting name}.
> Failed to disable {setting name}.
> Failed to save {setting name}.
> Failed to change domain ownership.

In the final case the copy can be simplified by not including the nuance that a success would have actually resulted in a request being made.

And remember, snackbar messages end with a period.

