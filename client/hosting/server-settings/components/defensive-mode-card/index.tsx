import { Button, FormLabel } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import FormSelect from 'calypso/components/forms/form-select';
import { HostingCard, HostingCardDescription } from 'calypso/components/hosting-card';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import {
	useEdgeCacheDefensiveModeMutation,
	useEdgeCacheDefensiveModeQuery,
} from 'calypso/data/hosting/use-cache';
import { EdgeCacheLoadingPlaceholder } from 'calypso/hosting/server-settings/components/cache-card/edge-cache-loading-placeholder';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

type DefensiveModeCardProps = {
	disabled?: boolean;
};

export default function DefensiveModeCard( { disabled }: DefensiveModeCardProps ) {
	const translate = useTranslate();
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
		<HostingCard
			className="defensive-mode-card"
			title={ translate( 'Defensive mode', {
				comment: 'Defensive mode is a feature to protect against DDoS attacks.',
				textOnly: true,
			} ) }
		>
			<HostingCardDescription>
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
			</HostingCardDescription>

			{ isLoadingDefensiveMode && <EdgeCacheLoadingPlaceholder /> }

			{ ! isLoadingDefensiveMode && defensiveModeData?.enabled && (
				<>
					<div className="defensive-mode-card__enabled-description">
						<div className="defensive-mode-card__enabled-indicator" />

						<HostingCardDescription>
							{ translate( '{{b}}Defensive mode is enabled{{/b}} until %(date)s.', {
								args: {
									date: enabledUntil.format( 'LLL' ),
								},
								comment: 'Defensive mode is a feature to protect against DDoS attacks.',
								components: {
									b: <strong />,
								},
							} ) }
						</HostingCardDescription>
					</div>

					<Button
						className="defensive-mode-card__button"
						busy={ isEnabling }
						disabled={ disabled || isEnabling }
						onClick={ () => {
							mutate( { active: false } );
						} }
					>
						{ translate( 'Disable defensive mode', {
							comment: 'Defensive mode is a feature to protect against DDoS attacks.',
						} ) }
					</Button>
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
							mutate( { active: true, ttl } );
						} }
					>
						{ translate( 'Enable defensive mode', {
							comment: 'Defensive mode is a feature to protect against DDoS attacks.',
						} ) }
					</Button>
				</>
			) }
		</HostingCard>
	);
}
