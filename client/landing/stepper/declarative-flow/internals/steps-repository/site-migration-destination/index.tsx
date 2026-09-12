import { Badge } from '@automattic/components';
import { Step } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { getMigrationWizardSteps } from '../../../flows/site-migration-flow/wizard-steps';
import { MigrationWizardProgress } from '../components/migration-wizard-progress';
import type { Step as StepType } from '../../types';
import type { BadgeType } from '@automattic/components';

import './style.scss';

type Destination = 'wpcom' | 'space-fast';

const SiteMigrationDestination: StepType< { submits: { destination: Destination } } > = ( {
	navigation,
} ) => {
	const { __ } = useI18n();
	const [ destination, setDestination ] = useState< Destination | null >( null );

	const options: {
		value: Destination;
		title: string;
		text: string;
		badge: { type: BadgeType; text: string };
	}[] = [
		{
			value: 'wpcom',
			title: __( 'WordPress.com' ),
			text: __(
				'Your site rebuilt as a real WordPress site — edit any page, add plugins, and keep growing.'
			),
			badge: { type: 'info-purple', text: __( 'Most popular' ) },
		},
		{
			value: 'space-fast',
			title: __( 'Space Fast' ),
			text: __(
				'A fast, hosted copy of your site exactly as it is today. Nothing to rebuild, nothing to learn.'
			),
			badge: { type: 'info-green', text: __( 'New' ) },
		},
	];

	const comparison = [
		{
			label: __( 'Editing' ),
			wpcom: __( 'Full block editor, themes, and plugins' ),
			spaceFast: __( 'Edit the files you already have' ),
		},
		{
			label: __( 'Best for' ),
			wpcom: __( 'Sites you want to keep building on' ),
			spaceFast: __( 'Sites you just want online, fast' ),
		},
		{
			label: __( 'Included with' ),
			wpcom: __( 'Any WordPress.com plan' ),
			spaceFast: __( 'Space Fast hosting' ),
		},
	];

	return (
		<>
			<DocumentHead title={ __( 'Where would you like your site to live?' ) } />
			<Step.CenteredColumnLayout
				className="step-container-v2--site-migration-destination"
				columnWidth={ 8 }
				topBar={
					<Step.TopBar
						centerElement={
							<MigrationWizardProgress
								steps={ getMigrationWizardSteps() }
								current="site-migration-destination"
							/>
						}
					/>
				}
				heading={
					<Step.Heading
						align="left"
						text={ __( 'Where would you like your site to live?' ) }
						subText={ __(
							'Both options bring over your content and your design. You can move again later.'
						) }
					/>
				}
				stickyBottomBar={ () => (
					<Step.StickyBottomBar
						leftElement={
							navigation.goBack ? <Step.BackButton onClick={ navigation.goBack } /> : null
						}
						rightElement={
							<Step.PrimaryButton
								disabled={ ! destination }
								onClick={ () => destination && navigation.submit( { destination } ) }
							>
								{ __( 'Continue' ) }
							</Step.PrimaryButton>
						}
					/>
				) }
			>
				<div
					className="site-migration-destination__options"
					role="radiogroup"
					aria-label={ __( 'Destination' ) }
				>
					{ options.map( ( option ) => (
						<div
							key={ option.value }
							className={ clsx( 'site-migration-destination__option', {
								'is-selected': destination === option.value,
							} ) }
						>
							<Badge
								className="site-migration-destination__option-badge"
								type={ option.badge.type }
							>
								{ option.badge.text }
							</Badge>
							<label className="site-migration-destination__option-title">
								<input
									type="radio"
									name="site-migration-destination"
									value={ option.value }
									checked={ destination === option.value }
									onChange={ () => setDestination( option.value ) }
								/>
								<span>{ option.title }</span>
							</label>
							<p className="site-migration-destination__option-text">{ option.text }</p>
						</div>
					) ) }
				</div>
				<table className="site-migration-destination__comparison">
					<thead>
						<tr>
							<td />
							{ options.map( ( option ) => (
								<th key={ option.value } scope="col">
									{ option.title }
								</th>
							) ) }
						</tr>
					</thead>
					<tbody>
						{ comparison.map( ( row ) => (
							<tr key={ row.label }>
								<th scope="row">{ row.label }</th>
								<td>{ row.wpcom }</td>
								<td>{ row.spaceFast }</td>
							</tr>
						) ) }
					</tbody>
				</table>
			</Step.CenteredColumnLayout>
		</>
	);
};

export default SiteMigrationDestination;
