import BulkDomainTransferFooter from './footer/BulkDomainTransferFooter';
import PlanFooter from './footer/PlanFooter';

const Footer = ( { isBulkDomainFlow }: { isBulkDomainFlow: boolean } ) => {
	if ( isBulkDomainFlow ) {
		return <BulkDomainTransferFooter />;
	}

	return <PlanFooter />;
};

export default Footer;
