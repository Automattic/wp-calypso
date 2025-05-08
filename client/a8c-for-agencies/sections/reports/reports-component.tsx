import { useTranslate } from 'i18n-calypso';

export default function ReportsComponent() {
	const translate = useTranslate();
	return (
		<div style={ { padding: 32 } }>
			<h1>{ translate( 'Reports' ) }</h1>
			<p>{ translate( 'This is the Reports section. Content coming soon.' ) }</p>
		</div>
	);
}
