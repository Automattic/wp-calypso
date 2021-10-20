import { Card } from '@automattic/components';
import CardHeading from 'calypso/components/card-heading';
import ClipboardButtonInput from 'calypso/components/clipboard-button-input';

interface Props {
	licenseKey: string;
	product: string;
	issuedAt: string;
}

const License: React.FunctionComponent< Props > = ( { licenseKey, product, issuedAt } ) => {
	return (
		<Card>
			<CardHeading size={ 3 } isBold>
				{ `${ product } - ${ issuedAt }` }
			</CardHeading>
			<ClipboardButtonInput value={ licenseKey } />
		</Card>
	);
};

export default License;
