import { Button, FormLabel } from '@automattic/components';
import { CALYPSO_CONTACT } from '@automattic/urls';
import { Icon } from '@wordpress/components';
import { info } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import FormSelect from 'calypso/components/forms/form-select';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { PanelCard, PanelCardDescription, PanelCardHeading } from 'calypso/components/panel';
import {
	useEdgeCacheDefensiveModeMutation,
	useEdgeCacheDefensiveModeQuery,
} from 'calypso/data/hosting/use-cache';
import { EdgeCacheLoadingPlaceholder } from 'calypso/sites/settings/performance/edge-cache-loading-placeholder';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './defensive-mode-form.scss';

type DefensiveModeFormProps = {
	disabled?: boolean;
};

export default function DefensiveModeForm( { disabled }: DefensiveModeFormProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const moment = useLocalizedMoment();

	const availableTtls = [
		{
			label: translate( '1 hour' ),
			value: 3600,
		},
		{
			label: translate( '12 hours' ),
			value: 43200,
		},
		{
			label: translate( '24 hours' ),
			value: 86400,
		},
		{
			label: translate( '2 days' ),
			value: 172800,
		},
		{
			label: translate( '7 days' ),
			value: 604800,
		},
	];

	const siteId = useSelector( getSelectedSiteId );
	const [ ttl, setTtl ] = useState( availableTtls[ 0 ].value );

	const { data: defensiveModeData, isLoading: isLoadingDefensiveMode } =
		useEdgeCacheDefensiveModeQuery( siteId );
	const { mutate, isPending: isEnabling } = useEdgeCacheDefensiveModeMutation( siteId );

	const enabledUntil = moment.unix( defensiveModeData?.enabled_until ?? 0 ).local();

	return (
		<PanelCard>
			<PanelCardHeading>
				{ translate( 'Defensive mode', {
					comment: 'Defensive mode is a feature to protect against DDoS attacks.',
					textOnly: true,
				} ) }
			</PanelCardHeading>
			<PanelCardDescription>
				{ translate(
					'Extra protection against spam bots and attacks. Visitors will see a quick loading page while we run additional security checks. {{a}}Learn more{{/a}}',
					{
						comment:
							'Explains what "Defensive mode" is. Defensive mode is a feature to protect against DDoS attacks.',
						components: {
							a: <InlineSupportLink supportContext="hosting-defensive-mode" showIcon={ false } />,
						},
					}
				) }
			</PanelCardDescription>

			{ isLoadingDefensiveMode && <EdgeCacheLoadingPlaceholder /> }

			{ ! isLoadingDefensiveMode && defensiveModeData?.enabled && (
				<>
					<div className="defensive-mode-card__enabled-description">
						<div className="defensive-mode-card__enabled-indicator" />

						<div className="defensive-mode__description">
							{ translate( '{{b}}Defensive mode is enabled{{/b}} until %(date)s.', {
								args: {
									date: enabledUntil.format( 'LLL' ),
								},
								comment: 'Defensive mode is a feature to protect against DDoS attacks.',
								components: {
									b: <strong />,
								},
							} ) }
						</div>
					</div>

					{ ! defensiveModeData.enabled_by_a11n && (
						<Button
							className="defensive-mode-card__button"
							busy={ isEnabling }
							disabled={ disabled || isEnabling }
							onClick={ () => {
								dispatch(
									recordTracksEvent( 'calypso_hosting_configuration_defensive_mode_disable' )
								);
								mutate( { active: false } );
							} }
						>
							{ translate( 'Disable defensive mode', {
								comment: 'Defensive mode is a feature to protect against DDoS attacks.',
							} ) }
						</Button>
					) }

					{ defensiveModeData.enabled_by_a11n && (
						<div className="defensive-mode-card__a11n-description">
							<div>
								<Icon icon={ info } size={ 24 } />
							</div>

							<div className="defensive-mode-card__a11n-text">
								<p>
									<strong>
										{ translate(
											'Defensive mode was enabled on your behalf to protect your site.',
											{ comment: 'Defensive mode is a feature to protect against DDoS attacks.' }
										) }
									</strong>
								</p>
								<p>
									{ translate(
										'Please {{a}}contact support{{/a}} if you need to disable defensive mode.',
										{
											comment:
												'Defensive mode is a feature to protect against DDoS attacks. This text is dislayed when defensive mode was enabled on behalf of users.',
											components: {
												a: <a href={ CALYPSO_CONTACT } target="_blank" rel="noopener noreferrer" />,
											},
										}
									) }
								</p>
							</div>
						</div>
					) }
				</>
			) }

			{ ! isLoadingDefensiveMode && ! defensiveModeData?.enabled && (
				<>
					<FormLabel htmlFor="defensive-mode-card__ttl-select">
						{ translate( 'Duration' ) }
					</FormLabel>

					<FormSelect
						disabled={ disabled || isEnabling }
						className="defensive-mode-card__ttl-select"
						id="defensive-mode-card__ttl-select"
						onChange={ ( event ) => setTtl( Number( event.currentTarget.value ) ) }
						value={ ttl }
					>
						{ availableTtls.map( ( option ) => (
							<option value={ option.value } key={ option.value }>
								{ option.label }
							</option>
						) ) }
					</FormSelect>

					<Button
						className="defensive-mode-card__button"
						busy={ isEnabling }
						disabled={ disabled || isEnabling }
						onClick={ () => {
							dispatch(
								recordTracksEvent( 'calypso_hosting_configuration_defensive_mode_enable', {
									ttl,
								} )
							);
							mutate( { active: true, ttl } );
						} }
					>
						{ translate( 'Enable defensive mode', {
							comment: 'Defensive mode is a feature to protect against DDoS attacks.',
						} ) }
					</Button>
				</>
			) }
		</PanelCard>
	);
}
