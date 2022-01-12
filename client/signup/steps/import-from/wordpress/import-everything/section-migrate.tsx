import { localize } from 'i18n-calypso';
import {
	connector,
	SectionMigrate as SectionMigrateOrigin,
} from 'calypso/my-sites/migrate/section-migrate';

export class SectionMigrate extends SectionMigrateOrigin {
	render() {
		return <>Overwritten SectionMigrate component</>;
	}
}

export default connector( localize( SectionMigrate ) );
