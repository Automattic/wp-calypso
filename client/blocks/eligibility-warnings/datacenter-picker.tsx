import styled from '@emotion/styled';
import { localize, LocalizeProps, translate } from 'i18n-calypso';

const DatacenterOptions = [
	{
		value: undefined,
		label: translate( 'Automatically place my site in the best datacenter' ),
	},
	{
		value: 'ams',
		label: translate( 'Amsterdam (AMS)' ),
	},
	{
		value: 'bur',
		label: translate( 'Burbank, California (BUR)' ),
	},
	{
		value: 'dfw',
		label: translate( 'Dallas-Fort Worth, Texas (DFW)' ),
	},
	{
		value: 'dca',
		label: translate( 'Washington, D.C. (DCA)' ),
	},
];

const Form = styled.form( {
	marginTop: '10px',
} );

const Label = styled.label( {
	display: 'block',
} );

const DatacenterPicker = ( { translate }: { translate: LocalizeProps[ 'translate' ] } ) => {
	return (
		<div>
			{ translate( 'Choose a datacenter for your site:' ) }
			<Form>
				{ DatacenterOptions.map( ( option ) => {
					return (
						<Label key={ option.label }>
							<input className="form-radio" name="datacenter" type="radio" value={ option.value } />
							{ option.label }
						</Label>
					);
				} ) }
			</Form>
		</div>
	);
};

export default localize( DatacenterPicker );
