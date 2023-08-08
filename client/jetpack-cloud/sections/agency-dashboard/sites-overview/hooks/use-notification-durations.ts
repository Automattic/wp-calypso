import { useTranslate } from 'i18n-calypso';

const useNotificationDurations = () => {
	const translate = useTranslate();

	return [
		{
			time: 1,
			label: translate( '1 minute' ),
			isPaid: true,
		},
		{
			time: 3,
			label: translate( '3 minutes' ),
		},
		{
			time: 5,
			label: translate( '5 minutes' ),
		},
		{
			time: 10,
			label: translate( '10 minutes' ),
		},
		{
			time: 15,
			label: translate( '15 minutes' ),
		},
		{
			time: 30,
			label: translate( '30 minutes' ),
		},
		{
			time: 60,
			label: translate( '1 hour' ),
		},
	];
};

export default useNotificationDurations;
