## Usage

```jsx
import BackupActionsToolbar from 'calypso/components/jetpack/backup-actions-toolbar';
import { useSelector } from 'react-redux';
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