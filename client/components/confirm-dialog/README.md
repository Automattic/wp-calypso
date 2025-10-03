# ConfirmDialog Component

The ConfirmDialog component is a reusable component that provides a confirmation dialog with customizable buttons and text.

## Usage
The ConfirmDialog package provides a set of components that can be used to compose the core component or be extended to support different kind of contents, instead of just text.

## Example usage

```jsx
	<ConfirmDialog
		onRequestClose={ this.closeAndCleanup }
		title="Some title"
	>
		<DialogContent>
			<p>
				Some Content
			</p>
		</DialogContent>

		<DialogFooter>
			<Button onClick={ this.onClickAtomicFollowUpConfirm } variant="tertiary">
				{ translate( 'Turn off auto-renew' ) }
			</Button>
			<Button href={ exportPath } variant="primary">
				{ translate( 'Download content' ) }
			</Button>
		</DialogFooter>
</ConfirmDialog>
```
