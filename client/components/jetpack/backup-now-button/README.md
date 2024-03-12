## Usage

```jsx
import BackupNowButton from 'calypso/components/jetpack/backup-now-button';
import { useSelector } from 'react-redux';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

function render() {
	const siteId = useSelector( getSelectedSiteId );

	return (
		<div>
			<BackupNowButton
				siteId={ siteId }
				variant="primary"
				tooltipText="Click here to backup your site now."
				trackEventName="calypso_jetpack_backup_now"
			>
				Back up now
			</BackupNowButton>
		</div>
	);
}
```