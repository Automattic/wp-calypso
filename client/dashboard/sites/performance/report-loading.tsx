import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Icon,
	Spinner,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { border, published } from '@wordpress/icons';
import { useInterval } from 'calypso/lib/interval/use-interval';
import { Text } from '../../components/text';

const useLoadingSteps = ( { isSavedReport }: { isSavedReport: boolean } ) => {
	const [ step, setStep ] = useState( 0 );

	const steps = isSavedReport
		? [ __( 'Checking for an existing report.' ) ]
		: [
				__( 'Running a new report.' ),
				__( 'Measuring Core Web Vitals.' ),
				__( 'Taking screenshots.' ),
				__( 'Fetching historic data.' ),
				__( 'Identifying performance improvements.' ),
				__( 'Finalizing your results.' ),
		  ];

	useInterval(
		() => {
			setStep( ( step ) => step + 1 );
		},
		// 5 seconds between steps, except make sure we stop _before_ completing the last step
		step < steps.length - 1 && 5000 // 5 seconds
	);

	return {
		step,
		steps,
	};
};

export default function ReportLoading( { isSavedReport }: { isSavedReport: boolean } ) {
	const { step, steps } = useLoadingSteps( {
		isSavedReport,
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
			{ ! isSavedReport && (
				<Text variant="muted">{ __( 'Testing your site may take around 30 seconds.' ) }</Text>
			) }
		</>
	);
}
