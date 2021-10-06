import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

const Superseded: React.FC = () => {
	const translate = useTranslate();

	return (
		<p className="display-price__you-own-this">
			<Gridicon className="display-price__you-own-this-icon" icon="checkmark-circle" size={ 48 } />
			{ translate( 'Superseded by your plan' ) }
		</p>
	);
};

export default Superseded;
