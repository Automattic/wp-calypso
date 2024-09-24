import { Button, FormLabel } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useState } from 'react';
import FormSelect from 'calypso/components/forms/form-select';
import { HostingCard, HostingCardDescription } from 'calypso/components/hosting-card';
import InlineSupportLink from 'calypso/components/inline-support-link';
import {
	useEdgeCacheDefensiveModeMutation,
	useEdgeCacheDefensiveModeQuery,
	useEdgeCacheQuery,
} from 'calypso/data/hosting/use-cache';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

type DefensiveModeCardProps = {
	disabled?: boolean;
};

const AVAILABLE_TTLS = [
	{
		label: '1h',
		value: 3600,
	},
	{
		label: '12h',
		value: 43200,
	},
	{
		label: '24h',
		value: 86400,
	},
	{
		label: '2d',
		value: 172800,
	},
	{
		label: '7d',
		value: 604800,
	},
];

export default function DefensiveModeCard( { disabled }: DefensiveModeCardProps ) {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const [ ttl, setTtl ] = useState( AVAILABLE_TTLS[ 0 ].value );

	const { data: isEdgeCacheActive } = useEdgeCacheQuery( siteId );
	const { data: defensiveModeData } = useEdgeCacheDefensiveModeQuery( siteId );
	const { mutate, isPending: isEnabling } = useEdgeCacheDefensiveModeMutation( siteId );

	const enabledUntil = moment.unix( defensiveModeData?.enabled_until ?? 0 );

	return (
		<HostingCard className="defensive-mode-card" title={ translate( 'Defensive mode' ) }>
			<HostingCardDescription>
				{ translate(
					'Extra protection against spam bots and attacks. Visitors will see a quick loading page while we run additional security checks. {{a}}Learn more{{/a}}',
					{
						components: {
							a: <InlineSupportLink supportContext="hosting-defensive-mode" showIcon={ false } />,
						},
					}
				) }
			</HostingCardDescription>

			{ ! isEdgeCacheActive && (
				<HostingCardDescription>
					<span className="defensive-mode-card__edge-cache-required">
						{ translate( 'Defensive mode requires {{a}}global edge cache{{/a}} to be enabled.', {
							components: {
								a: <InlineSupportLink supportContext="hosting-edge-cache" showIcon={ false } />,
							},
						} ) }
					</span>
				</HostingCardDescription>
			) }

			{ isEdgeCacheActive && defensiveModeData?.enabled && (
				<>
					<div className="defensive-mode-card__enabled-description">
						<div className="defensive-mode-card__enabled-indicator" />

						<HostingCardDescription>
							{ translate( '{{b}}Defensive mode is enabled{{/b}} until %(time)s on %(date)s.', {
								args: {
									date: enabledUntil.format( 'LL' ),
									time: enabledUntil.format( 'LT' ),
								},
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
						{ translate( 'Disable defensive mode' ) }
					</Button>
				</>
			) }

			{ isEdgeCacheActive && ! defensiveModeData?.enabled && (
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
						{ AVAILABLE_TTLS.map( ( option ) => (
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
						{ translate( 'Enable defensive mode' ) }
					</Button>
				</>
			) }
		</HostingCard>
	);
}
