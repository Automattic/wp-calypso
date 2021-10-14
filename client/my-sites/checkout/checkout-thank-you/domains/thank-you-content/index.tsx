import { DomainThankYouPropsGetter, DomainThankYouType } from '../types';
import DomainMappingProps from './domain-mapping';
import DomainMappingWithEmailThankYouProps from './domain-mapping-with-email';
import DomainTransferProps from './domain-transfer';

const thankYouContentGetter: Record< DomainThankYouType, DomainThankYouPropsGetter > = {
	MAPPING: DomainMappingProps,
	TRANSFER: DomainTransferProps,
	MAPPING_WITH_EMAIL: DomainMappingWithEmailThankYouProps,
};

export default thankYouContentGetter;
