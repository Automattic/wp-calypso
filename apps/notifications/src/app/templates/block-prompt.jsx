import { html } from '../indices-to-html';
import { p } from './functions';

const PromptBlock = ( { block } ) => <div className="wpnc__prompt">{ p( html( block ) ) }</div>;

export default PromptBlock;
