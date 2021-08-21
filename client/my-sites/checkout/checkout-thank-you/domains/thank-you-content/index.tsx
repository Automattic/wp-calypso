import { DomainThankYouPropsGetter, DomainThankYouType } from '../types';
import { default as DomainMappingProps, default as DomainTransferProps } from './domain-mapping';

const thankYouContentGetter: Record< DomainThankYouType, DomainThankYouPropsGetter > = {
	MAPPING: DomainMappingProps,
	TRANSFER: DomainTransferProps,
};

export default thankYouContentGetter;
