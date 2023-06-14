import { useTranslate } from 'i18n-calypso';
import { AudienceList } from 'calypso/data/promote-post/types';

interface Props {
	audienceList: AudienceList;
}
export default function AudienceBlock( { audienceList }: Props ) {
	const translate = useTranslate();

	const devicesList = audienceList[ 'devices' ] || '';
	const countriesList = audienceList[ 'countries' ] || '';
	const topicsList = audienceList[ 'topics' ] || '';
	const OSsList = audienceList[ 'OSs' ] || '';

	return (
		<>
			{ devicesList ? `${ translate( 'Devices' ) }: ${ devicesList }` : '' }
			<br />
			{ countriesList ? `${ translate( 'Location' ) }: ${ countriesList }` : '' }
			<br />
			{ topicsList ? `${ translate( 'Interests' ) }: ${ topicsList }` : '' }
			<br />
			{ OSsList ? `${ translate( 'Operating systems' ) }: ${ OSsList }` : '' }
		</>
	);
}
