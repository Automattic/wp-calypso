import * as React from 'react';

interface Props {
	name: string;
}
export const ColorPalette: React.FunctionComponent< Props > = ( props ) => {
	const { name } = props;

	return <div>This is Color Palette</div>;
};

export default ColorPalette;
