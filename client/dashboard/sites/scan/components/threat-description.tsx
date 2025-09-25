import { Threat } from '@automattic/api-core';
import { ExternalLink, __experimentalVStack as VStack } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import MarkedLines from '../../../components/marked-lines';
import { Text } from '../../../components/text';
import { CODEABLE_JETPACK_SCAN_URL } from '../constants';

export function ThreatDescription( { threat }: { threat: Threat } ) {
	const renderFixTitle = () => {
		switch ( threat.status ) {
			case 'fixed':
				return __( 'How did Jetpack fix it?' );
			case 'current':
				if ( threat.fixable && threat.status === 'current' ) {
					return __( 'How will we fix it?' );
				}
				return __( 'How to resolve or handle this detection?' );
			default:
				return __( 'How will we fix it?' );
		}
	};

	const renderFilename = () => {
		const { filename } = threat;
		if ( ! filename ) {
			return null;
		}

		return (
			<>
				<Text variant="muted">
					{
						/* translators: filename follows in separate line; e.g. "PHP.Injection.5 in: `post.php`" */
						__( 'Threat found in file:' )
					}
				</Text>
				<Text as="pre">{ filename }</Text>
			</>
		);
	};

	const renderDatabaseRows = () => {
		const { table, details, pk_column, value } = threat;

		if ( ! table || ! details ) {
			return null;
		}

		const row = {
			table,
			primary_key_column: pk_column,
			primary_key_value: value,
			details,
		};
		const content = JSON.stringify( row, null, '\t' ) + '\n';

		return (
			<>
				<Text>
					{ sprintf(
						/* translators: %s: table name */
						__( 'Threat found in the table %s, in the following rows:' ),
						table
					) }
				</Text>
				<Text as="pre">{ content }</Text>
			</>
		);
	};

	const getThreatFix = () => {
		const { fixable } = threat;

		if ( ! fixable ) {
			return null;
		}

		switch ( fixable.fixer ) {
			case 'replace':
				return __( 'Jetpack Scan will replace the affected file or directory.' );
			case 'delete':
				return __( 'Jetpack Scan will delete the affected file or directory.' );
			case 'update':
				if ( fixable.target ) {
					return sprintf(
						/** translators: %s: version */
						__( 'Jetpack Scan will update to a newer version (%s).' ),
						fixable.target
					);
				}
				return __( 'Jetpack Scan will update to a newer version.' );
			case 'edit':
				return __( 'Jetpack Scan will edit the affected file or directory.' );
			case 'rollback':
				if ( fixable.target ) {
					return sprintf(
						/** translators: %s: version */
						__( 'Jetpack Scan will rollback the affected file to the version from %s.' ),
						fixable.target
					);
				}
				return __( 'Jetpack Scan will rollback the affected file to an older (clean) version.' );
			default:
				return __( 'Jetpack Scan will resolve the threat.' );
		}
	};

	const renderFix = () => {
		if ( threat.status === 'fixed' ) {
			return;
		}

		if ( ! threat.fixable ) {
			return (
				<>
					{ ! threat.rows && (
						<Text variant="muted">
							{ __(
								'Jetpack Scan cannot automatically fix this threat. We suggest that you resolve the threat manually: ensure that WordPress, your theme, and all of your plugins are up to date, and remove the offending code, theme, or plugin from your site.'
							) }
						</Text>
					) }
					{ threat.rows && (
						<Text variant="muted">
							{ __(
								'Jetpack Scan cannot automatically fix this threat. We suggest that you resolve the threat manually: ensure that WordPress, your theme, and all of your plugins are up to date, and remove or edit the offending post from your site.'
							) }
						</Text>
					) }
					{ 'current' === threat.status && (
						<Text variant="muted">
							{ createInterpolateElement(
								__(
									'If you need more help to resolve this threat, we recommend <codeable />, a trusted freelancer marketplace of highly vetted WordPress experts. They have identified a select group of security experts to help with these projects. Pricing ranges from $70–120/hour, and you can get a free estimate with no obligation to hire.'
								),
								{
									codeable: (
										<ExternalLink href={ CODEABLE_JETPACK_SCAN_URL }>Codeable</ExternalLink>
									),
								}
							) }
						</Text>
					) }
				</>
			);
		}

		return (
			<>
				<Text variant="muted">
					{ __(
						'Jetpack Scan is able to automatically fix this threat for you. Since it will replace the affected file or directory the site’s look-and-feel or features can be compromised. We recommend that you check if your latest backup was performed successfully in case a restore is needed.'
					) }
				</Text>
				<Text variant="muted">{ getThreatFix() }</Text>
			</>
		);
	};

	return (
		<VStack spacing={ 4 }>
			<Text size="large" weight={ 500 }>
				{ __( 'What did Jetpack find?' ) }
			</Text>
			<Text variant="muted">{ threat.description }</Text>
			{ threat.payload_description && <Text>{ threat.payload_description }</Text> }
			{ threat.source && (
				<ExternalLink href={ threat.source }>
					{ __( 'Learn more about this vulnerability' ) }
				</ExternalLink>
			) }
			{ ( threat.filename || threat.context || threat.diff || threat.rows ) && (
				<Text size="large" weight={ 500 }>
					{ __( 'The technical details' ) }
				</Text>
			) }
			{ renderFilename() }
			{ renderDatabaseRows() }
			{ threat.context && <MarkedLines context={ threat.context } /> }
			{ threat.status !== 'fixed' && (
				<Text size="large" weight={ 500 }>
					{ renderFixTitle() }
				</Text>
			) }
			{ renderFix() }
		</VStack>
	);
}
