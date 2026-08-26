import {
	Button,
	SearchControl,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import { Card, CardBody } from '../../../components/card';
import type { AgencyLicense, AgencySite } from './mock-data';

export default function AssignLicenseModal( {
	license,
	sites,
	onAssign,
	onCancel,
}: {
	license: AgencyLicense;
	sites: AgencySite[];
	onAssign: ( site: AgencySite ) => void;
	onCancel: () => void;
} ) {
	const [ search, setSearch ] = useState( '' );
	const [ selected, setSelected ] = useState< number | null >( null );

	const filtered = sites.filter( ( site ) =>
		site.url.toLowerCase().includes( search.trim().toLowerCase() )
	);
	const selectedSite = sites.find( ( site ) => site.blogId === selected );

	return (
		<VStack spacing={ 4 }>
			<Text variant="muted">
				{ sprintf(
					/* translators: %s: product name */
					__( 'Select the site to assign %s to.' ),
					license.product
				) }
			</Text>

			<SearchControl
				__nextHasNoMarginBottom
				value={ search }
				onChange={ setSearch }
				placeholder={ __( 'Search sites by URL' ) }
			/>

			<VStack spacing={ 2 } className="marketplace-purchases__assign-list" role="radiogroup">
				{ filtered.map( ( site ) => {
					const isSelected = site.blogId === selected;
					return (
						<Card
							key={ site.blogId }
							className={
								'marketplace-purchases__site-card' +
								( isSelected ? ' is-selected' : '' ) +
								( site.connected ? '' : ' is-disabled' )
							}
							role="radio"
							aria-checked={ isSelected }
							aria-disabled={ ! site.connected }
							tabIndex={ site.connected ? 0 : -1 }
							onClick={ site.connected ? () => setSelected( site.blogId ) : undefined }
							onKeyDown={ ( event: React.KeyboardEvent ) => {
								if ( site.connected && ( event.key === 'Enter' || event.key === ' ' ) ) {
									event.preventDefault();
									setSelected( site.blogId );
								}
							} }
						>
							<CardBody>
								<HStack justify="space-between" alignment="center">
									<HStack spacing={ 3 } justify="flex-start" alignment="center" expanded={ false }>
										<span
											className={ 'marketplace-purchases__radio' + ( isSelected ? ' is-on' : '' ) }
										/>
										<Text>{ site.url }</Text>
									</HStack>
									{ ! site.connected && (
										<Text variant="muted" size={ 12 }>
											{ __( 'Connect your WordPress.com user to assign' ) }
										</Text>
									) }
								</HStack>
							</CardBody>
						</Card>
					);
				} ) }
				{ filtered.length === 0 && (
					<Text variant="muted">{ __( 'No sites match your search.' ) }</Text>
				) }
			</VStack>

			<HStack justify="flex-end" spacing={ 3 }>
				<Button variant="tertiary" onClick={ onCancel }>
					{ __( 'Cancel' ) }
				</Button>
				<Button
					variant="primary"
					__next40pxDefaultSize
					disabled={ ! selectedSite }
					onClick={ () => selectedSite && onAssign( selectedSite ) }
				>
					{ __( 'Assign to site' ) }
				</Button>
			</HStack>
		</VStack>
	);
}
