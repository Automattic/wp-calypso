import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Icon,
	Spinner,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { border, published } from '@wordpress/icons';
import { Text } from '../../components/text';
import useLoadingSteps from './use-loading-steps';

export default function ReportLoading( {
	isSavedReport = true,
	isLoadingPages = false,
}: {
	isSavedReport?: boolean;
	isLoadingPages?: boolean;
} ) {
	const getSteps = () => {
		if ( isLoadingPages ) {
			return [ __( 'Getting your site pages.' ) ];
		}
		return isSavedReport
			? [ __( 'Checking for an existing report.' ) ]
			: [
					__( 'Running a new report.' ),
					__( 'Measuring Core Web Vitals.' ),
					__( 'Taking screenshots.' ),
					__( 'Fetching historic data.' ),
					__( 'Identifying performance improvements.' ),
					__( 'Finalizing your results.' ),
			  ];
	};

	const { step, steps } = useLoadingSteps( {
		steps: getSteps(),
		duration: 5000, // 5 seconds
	} );

	const getIcon = ( index: number, step: number ) => {
		const iconSize: number = 32;

		if ( step > index ) {
			return (
				<Icon
					style={ { fill: 'var(--dashboard__foreground-color-success)' } }
					icon={ published }
					size={ iconSize }
				/>
			);
		}
		if ( step === index ) {
			return (
				<Spinner
					style={ {
						margin: '6px',
						height: '20px',
						width: '20px',
					} }
				/>
			);
		}
		return (
			<Icon
				style={ { fill: 'var(--dashboard-overview__divider-color)' } }
				icon={ border }
				size={ iconSize }
			/>
		);
	};

	return (
		<>
			<VStack justify="flex-start">
				{ steps.map( ( heading, index ) => (
					<HStack justify="flex-start" key={ index } spacing={ 1 }>
						{ getIcon( index, step ) }
						<Text>{ heading }</Text>
					</HStack>
				) ) }
			</VStack>
		</>
	);
}
