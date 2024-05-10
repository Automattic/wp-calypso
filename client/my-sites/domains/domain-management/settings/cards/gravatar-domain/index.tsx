import { useTranslate } from 'i18n-calypso';
import { GravatarDomainCardProps } from './types';

const GravatarDomainCard = ( props: GravatarDomainCardProps ) => {
	const translate = useTranslate();
	const { selectedDomainName } = props;

	return (
		<div>
			<div>
				<p>{ translate( 'Placeholder text for Gravatar domain card.' ) }</p>
				<p>{ selectedDomainName }</p>
			</div>
		</div>
	);
};

export default GravatarDomainCard;
