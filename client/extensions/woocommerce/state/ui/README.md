State
=====

This directory contains the UI behavior describing the application state for the
woocommerce extension. This is a sub-tree of the woocommerce state, stored in
`state.extensions.woocommerce.ui`.

## Structure

### [`payment`](ui/README.md)

Tracks all payment settings state relating to the payment settings page.

When updating, creating, and deleting payment methods we need to track those
changes locally as the api does not return a clean payment method on save. By
tracking those changes locally we can overlay those edits, creates, and deletes
over the existing data from the api.  This uses something called buckets. For
each operation there is a bucket: create, delete, and update. When a change is
made those changes get placed in each bucket keyed by method id.  This pattern
is also used in woocommerce.state.ui.shipping.
