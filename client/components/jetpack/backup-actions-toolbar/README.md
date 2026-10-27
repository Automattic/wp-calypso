## Usage

```jsx
import { useSelector } from 'react-redux';
import BackupActionsToolbar from 'calypso/components/jetpack/backup-actions-toolbar';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

function render() {
	const siteId = useSelector( getSelectedSiteId );

	return (
		<div>
			<BackupActionsToolbar siteId={ siteId } />
		</div>
	);
}
```
