import './style.scss';

import { WordPressLogo } from '@automattic/components';
import { css, Global, ThemeProvider } from '@emotion/react';
import { Button, ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import Masterbar from 'calypso/layout/masterbar/masterbar';
import MarketplaceProgressBar from 'calypso/my-sites/marketplace/components/progressbar';
import theme from 'calypso/my-sites/marketplace/theme';
import HonestInstallProgress from '../marketplace-product-install/honest-progress';
import HonestInstallScene from '../marketplace-product-install/honest-progress/scene';
import ProductInstallErrorView from '../marketplace-product-install/product-install-error';
import useMarketplaceAdditionalSteps from '../marketplace-product-install/use-marketplace-additional-steps';
import { useFakeTransfer } from './use-fake-transfer';
import type { DemoScenario } from './use-fake-transfer';

type Variant = 'control' | 'honest_progress' | 'honest_scene';

const VARIANTS: { value: Variant; label: string }[] = [
	{ value: 'honest_progress', label: 'Narrated list' },
	{ value: 'honest_scene', label: 'Illustrated scene' },
	{ value: 'control', label: 'Classic bar (today)' },
];

const SCENARIOS: { value: DemoScenario; label: string }[] = [
	{ value: 'typical', label: 'Typical (~40 s)' },
	{ value: 'slow', label: 'Slow server' },
	{ value: 'failure', label: 'Failure mid-move' },
];

function ChoiceRow< T extends string >( {
	label,
	value,
	options,
	onChange,
}: {
	label: string;
	value: T;
	options: { value: T; label: string }[];
	onChange: ( value: T ) => void;
} ) {
	return (
		<div className="marketplace-wait-demo__row" role="group" aria-label={ label }>
			<span className="marketplace-wait-demo__row-label">{ label }</span>
			{ options.map( ( option ) => (
				<Button
					key={ option.value }
					variant={ option.value === value ? 'primary' : 'secondary' }
					size="compact"
					aria-pressed={ option.value === value }
					onClick={ () => onChange( option.value ) }
				>
					{ option.label }
				</Button>
			) ) }
		</div>
	);
}

/**
 * A stage for the transfer wait UIs: a fake transfer that runs on the real stage timings and can
 * be replayed at will, so the variants can be reviewed without buying a plugin.
 */
export default function MarketplaceWaitDemo() {
	const translate = useTranslate();
	const [ variant, setVariant ] = useState< Variant >( 'honest_progress' );
	const [ scenario, setScenario ] = useState< DemoScenario >( 'typical' );
	const [ realTime, setRealTime ] = useState( false );
	const { transferStatus, currentStep, elapsed, isDone, isFailed, run, replay } = useFakeTransfer( {
		scenario,
		speed: realTime ? 1 : 4,
	} );
	const additionalSteps = useMarketplaceAdditionalSteps();

	// The wait UIs keep their own clock from mount, exactly as they do in production, so switching
	// the variant mid-run would show a fresh clock against a half-run transfer. Start over instead.
	const changeVariant = ( next: Variant ) => {
		setVariant( next );
		replay();
	};
	const changeScenario = ( next: DemoScenario ) => {
		setScenario( next );
		replay();
	};
	const classicSteps = [
		translate( 'Setting up plugin installation' ),
		translate( 'Installing plugin' ),
		translate( 'Activating plugin' ),
	];

	let stage: React.ReactNode;
	if ( isFailed ) {
		stage = (
			<ProductInstallErrorView
				error={ { type: 'transfer-failed' } }
				pluginSlug="demo-plugin"
				themeSlug=""
				onActivateTheme={ () => {} }
			/>
		);
	} else if ( isDone ) {
		stage = (
			<div className="marketplace-wait-demo__done">
				<h1>{ translate( 'Done — the real page redirects to the thank-you screen here.' ) }</h1>
				<Button variant="primary" onClick={ replay }>
					{ translate( 'Replay' ) }
				</Button>
			</div>
		);
	} else if ( variant === 'honest_progress' ) {
		stage = <HonestInstallProgress transferStatus={ transferStatus } currentStep={ currentStep } />;
	} else if ( variant === 'honest_scene' ) {
		stage = <HonestInstallScene transferStatus={ transferStatus } currentStep={ currentStep } />;
	} else {
		stage = (
			<MarketplaceProgressBar
				steps={ classicSteps }
				currentStep={ currentStep }
				additionalSteps={ additionalSteps }
			/>
		);
	}

	return (
		<ThemeProvider theme={ theme }>
			<Masterbar className="marketplace-plugin-install__masterbar">
				<Global
					styles={ css`
						body {
							--masterbar-height: 72px;
						}
					` }
				/>
				<WordPressLogo className="marketplace-plugin-install__logo" size={ 24 } />
			</Masterbar>
			<div className="marketplace-wait-demo__controls">
				<ChoiceRow
					label="Variant"
					value={ variant }
					options={ VARIANTS }
					onChange={ changeVariant }
				/>
				<ChoiceRow
					label="Scenario"
					value={ scenario }
					options={ SCENARIOS }
					onChange={ changeScenario }
				/>
				<div className="marketplace-wait-demo__row">
					<ToggleControl
						__nextHasNoMarginBottom
						label="Real time (off = 4× speed)"
						checked={ realTime }
						onChange={ setRealTime }
					/>
					<span className="marketplace-wait-demo__clock">
						{ transferStatus ?? 'idle' } · { Math.floor( elapsed ) } s
					</span>
					<Button variant="secondary" size="compact" onClick={ replay }>
						↺ Replay
					</Button>
				</div>
				<p className="marketplace-wait-demo__note">
					Fake transfer on the real production stage timings. Nothing is installed and no heartbeat
					is recorded.
				</p>
			</div>
			<div key={ run } className="marketplace-plugin-install__root marketplace-wait-demo__stage">
				{ stage }
			</div>
		</ThemeProvider>
	);
}
