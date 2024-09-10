import { Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import SectionHeader from 'calypso/components/section-header';
import wp from 'calypso/lib/wp';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

const NOTICE_ID = 'request-dpa-notice';

const DPA = () => {
	const [ isLoading, setLoading ] = useState( false );
	const translate = useTranslate();
	const dispatch = useDispatch();

	const requestDpa = async () => {
		try {
			setLoading( true );
			await wp.req.post( '/me/request-dpa', { apiNamespace: 'wpcom/v2' } );
			dispatch(
				successNotice(
					translate( 'Request successful! We are sending you our DPA via email', {
						comment:
							'A Data Processing Addendum (DPA) is a document to assure customers, vendors, and partners that their data handling complies with the law.',
					} ),
					{ id: NOTICE_ID }
				)
			);
		} catch ( error ) {
			dispatch(
				errorNotice(
					error.error === 'too_many_requests'
						? error.message
						: translate( 'There was an error requesting a DPA', {
								comment:
									'A Data Processing Addendum (DPA) is a document to assure customers, vendors, and partners that their data handling complies with the law.',
						  } ),
					{ id: NOTICE_ID }
				)
			);
		} finally {
			setLoading( false );
		}
	};

	return (
		<>
			<SectionHeader
				label={ translate( 'Data processing addendum', {
					comment:
						'A Data Processing Addendum (DPA) is a document to assure customers, vendors, and partners that their data handling complies with the law.',
				} ) }
			/>
			<Card>
				<p>
					{ translate(
						'A Data Processing Addendum (DPA) allows web sites and companies to assure customers, vendors, ' +
							'and partners that their data handling complies with the law.'
					) }
				</p>

				<p>
					{ translate( 'Note: most free site owners or hobbyists do not need a DPA.', {
						comment:
							'A Data Processing Addendum (DPA) is a document to assure customers, vendors, and partners that their data handling complies with the law.',
					} ) }
				</p>

				<p>
					<strong>
						{ translate(
							'Having a DPA does not change any of our privacy and security practices for site visitors. ' +
								'Everyone using our service gets the same high standards of privacy and security.',
							{
								comment:
									'A Data Processing Addendum (DPA) is a document to assure customers, vendors, and partners that their data handling complies with the law.',
							}
						) }
					</strong>
				</p>
				<Button
					className="privacy__dpa-request-button"
					disabled={ isLoading }
					onClick={ requestDpa }
				>
					{ translate( 'Request a DPA', {
						comment:
							'A Data Processing Addendum (DPA) is a document to assure customers, vendors, and partners that their data handling complies with the law.',
					} ) }
				</Button>
			</Card>
		</>
	);
};

export default DPA;
