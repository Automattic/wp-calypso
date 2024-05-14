import { useTranslate } from 'i18n-calypso';

const GravatarDomainCard = () => {
	const translate = useTranslate();

	return (
		<div>
			<div>
				<p>{ translate( 'This domain is used as a custom domain for your Gravatar profile.' ) }</p>
			</div>
		</div>
	);
};

export default GravatarDomainCard;
