declare module 'calypso/lib/wp' {
	import WPCOM from 'wpcom';

	const wpcom: WPCOM;
	const wpcomJetpackLicensing: WPCOM;

	export default wpcom;
	export { wpcomJetpackLicensing };
}
