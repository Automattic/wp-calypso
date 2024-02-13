## Usage

```jsx
import BackupActionsToolbar from 'calypso/components/jetpack/backup-actions-toolbar';
import { useSelector } from 'react-redux';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

function render() {
    const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );

	return (
		<div>
			<BackupActionsToolbar siteId={ siteId } siteSlug={ siteSlug } />
		</div>
	);
}
```