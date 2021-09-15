import { DomainThankYouPropsGetter, DomainThankYouType } from '../types';
import DomainMappingProps from './domain-mapping';
import DomainTransferProps from './domain-transfer';

const thankYouContentGetter: Record< DomainThankYouType, DomainThankYouPropsGetter > = {
	MAPPING: DomainMappingProps,
	TRANSFER: DomainTransferProps,
};

export default thankYouContentGetter;
