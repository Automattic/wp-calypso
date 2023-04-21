import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import './gravatar.scss';

const GravatarOauthMasterbar = ( { iconUrl, iconAlt } ) => {
	const translate = useTranslate();

	return (
		<header className="gravatar-masterbar">
			<nav className="gravatar-masterbar__nav">
				<img src={ iconUrl } alt={ iconAlt } width={ 27 } height={ 27 } />
				<a className="gravatar-masterbar__link" href="https://gravatar.com">
					<Gridicon icon="chevron-left" /> { translate( 'Back' ) }
				</a>
			</nav>
		</header>
	);
};

export default GravatarOauthMasterbar;
