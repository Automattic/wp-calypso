import { useTranslate } from 'i18n-calypso';

export default function DomainOnlyNew() {
	const translate = useTranslate();

	return (
		<div className="domain-only-new">
			<h1>{ translate( 'Thank you for your purchase!' ) }</h1>
			<p>{ translate( 'Your domain is being set up.' ) }</p>
		</div>
	);
}
