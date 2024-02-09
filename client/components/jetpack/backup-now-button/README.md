## Usage

```jsx
import BackupNowButton from 'calypso/components/jetpack/backup-now-button';

function render() {
	return (
		<div>
			<BackupNowButton
				variant="primary"
				toolTipText="Click here to backup your site now."
				trackEventName="calypso_jetpack_backup_now"
			>
				Backup Now
			</BackupNowButton>
		</div>
	);
}
```