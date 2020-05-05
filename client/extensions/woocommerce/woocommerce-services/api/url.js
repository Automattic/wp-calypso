export const accountSettings = 'connect/account/settings';
export const packages = 'connect/packages';
export const orderLabels = ( orderId ) => `connect/label/${ orderId }`;
export const getLabelRates = ( orderId ) => `connect/label/${ orderId }/rates`;
export const labelStatus = ( orderId, labelId ) => `connect/label/${ orderId }/${ labelId }`;
export const labelRefund = ( orderId, labelId ) => `connect/label/${ orderId }/${ labelId }/refund`;
export const labelsPrint = () => 'connect/label/print';
export const labelsTestPrint = () => 'connect/label/preview';
export const addressNormalization = () => 'connect/normalize-address';
export const serviceSettings = ( methodId, instanceId = 0 ) =>
	`connect/services/${ methodId }/${ instanceId }`;
