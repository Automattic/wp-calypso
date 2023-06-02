/* eslint-disable wpcalypso/jsx-classname-namespace */

import { __ } from '@wordpress/i18n';
import Badge from 'calypso/components/badge';
import './style.scss';

interface Props {
	domain: string;
}

const DomainInfo: React.FunctionComponent< Props > = ( { domain } ) => {
	return (
		<div className="temp-domain-item">
			<div className="temp-domain-item__label">{ __( 'Your temporary site is:' ) }</div>
			<div className="temp-domain-item__description">
				<span>{ domain }</span>
				<Badge className="temp-domain-item__primary-badge" type="info-green">
					{ __( 'New' ) }
				</Badge>
			</div>
		</div>
	);
};
export default DomainInfo;
