/**
 * The Red.es agreement (Annex III of the registrar contract) that .es registrants accept at
 * checkout.
 *
 * The Spanish text is the legally binding one; the English text is a courtesy translation.
 * Both are kept word for word as provided by legal and deliberately do not go through
 * `translate()`.
 *
 * Any change to either text MUST bump `RED_ES_AGREEMENT_VERSION` in the same PR: the backend
 * logs the version the customer accepted, and the accepted text is this module at that version.
 * The version may only contain `[A-Za-z0-9._-]` and be at most 32 characters long.
 */
export const RED_ES_AGREEMENT_VERSION = 'anexo-iii-2024.01-r1';

/**
 * The customer values interpolated in the agreement. Keep in sync with the `values` the backend
 * logs with the accepted version (DOMENG-1213).
 *
 * The applicant is always a person, never the company: the registrant when the owner is an
 * individual, otherwise the contact person (the same first and last name) with the contact
 * person's NIF/NIE.
 */
export const RED_ES_AGREEMENT_FIELDS = [
	'applicant_name',
	'applicant_identification_number',
	'domains',
] as const;

export type RedEsAgreementField = ( typeof RED_ES_AGREEMENT_FIELDS )[ number ];

export type RedEsAgreementValues = {
	[ K in RedEsAgreementField ]: K extends 'domains' ? string[] : string;
};

export interface RedEsAgreementTemplate {
	version: string;
	title: string;
	body_html: string;
}

const dataProtectionTableEs = `
<table>
	<thead>
		<tr><th scope="col">Campo</th><th scope="col">Contenido</th></tr>
	</thead>
	<tbody>
		<tr><th scope="row">Nombre del tratamiento</th><td>DOMINIOS.ES</td></tr>
		<tr><th scope="row">Fines del tratamiento</th><td><p>Gestión de las relaciones para la asignación de nombres de dominio y relación con los titulares y/o agentes registradores autorizados.</p><p>Reutilización de información asociada a los nombres de dominio ".es" de conformidad con la Ley 37/2007, de 16 de noviembre, sobre reutilización de la información del sector público.</p><p>Realización de informes, estudios y análisis agregados sobre el uso de los dominios ".es" por parte de Red.es o, de forma conjunta, con otras organizaciones o entidades, españolas o internacionales, las cuales tengan dentro de sus finalidades la gestión de nombres de dominio.</p><p>Acuerdos de colaboración con otras Administraciones Públicas o entidades españolas, así como con organismos u organizaciones internacionales, con las que Red.es suscriba convenios en el ámbito de sus competencias.</p><p>Realización de estudios, fines de archivo en interés público, fines de investigación científica o histórica o fines estadísticos relacionados con la actividad del Registro.</p></td></tr>
		<tr><th scope="row">Responsable del tratamiento</th><td>Red.es: Edificio Bronce, Plaza Manuel Gómez Moreno, s/n, 28020 Madrid. Teléfono: 901100167. Email: protecciondedatos@red.es</td></tr>
		<tr><th scope="row">Encargado del tratamiento</th><td>En las tareas de gestión de dominios.es se han detectado encargados de tratamiento, que se podrán consultar como anexo a esta ficha.</td></tr>
		<tr><th scope="row">Delegado de Protección de Datos</th><td>Teléfono: 901100167. Email: protecciondedatos@red.es</td></tr>
		<tr><th scope="row">Categoría de datos</th><td>Nombres y apellidos, documento identificativo, dirección, teléfono y correo electrónico. Información profesional.</td></tr>
		<tr><th scope="row">Colectivo</th><td>Agentes Registradores y solicitantes. Titulares de los dominios .es.</td></tr>
		<tr><th scope="row">Departamento implicado</th><td>Dominios</td></tr>
		<tr><th scope="row">Legitimación</th><td><p>Mantenimiento de las relaciones contractuales con los Agentes Registradores y con los titulares de los dominios.</p><p>Interés legítimo propio y de terceros para conocer el grado de utilización y finalidades de los dominios .es.</p></td></tr>
		<tr><th scope="row">Plazo de supresión</th><td>10 años tras la finalización del contrato</td></tr>
		<tr><th scope="row">Medidas de seguridad</th><td><p>Las medidas de seguridad implantadas en la entidad pública empresarial Red.es, M.P. se corresponden con las previstas en el Anexo II (Medidas de seguridad) del Real Decreto 311/2022, de 3 de mayo, por el que se regula el Esquema Nacional de Seguridad en el ámbito de la Administración Electrónica, y de forma adicional se han implementado los controles de seguridad del Sistema de Gestión de la Seguridad de la Información basado en la Norma UNE-EN ISO/IEC 27001.</p><p>En el caso de las medidas de seguridad de terceros que mantengan una relación contractual con el Registro, las medidas de seguridad serán las mismas o equivalentes a las anteriormente indicadas.</p></td></tr>
		<tr><th scope="row">Transferencias internacionales</th><td><p>Se contemplan transferencias internacionales con aquellas entidades que mantengan una relación contractual con el Registro y por motivos de interés público (seguridad del Registro).</p><p>El detalle de dichas relaciones contractuales se podrá consultar como anexo a esta ficha.</p></td></tr>
		<tr><th scope="row">Ejercicio de derechos</th><td>Podrá ejercer los derechos de acceso, rectificación, supresión y portabilidad de sus datos, y la limitación u oposición a su tratamiento, a través de la cumplimentación de un formulario disponible en la sede electrónica de Red.es y dirigido al Responsable del Tratamiento (Red.es): <a href="https://sede.red.gob.es/" target="_blank" rel="noopener noreferrer">https://sede.red.gob.es/</a> o protecciondedatos@red.es</td></tr>
		<tr><th scope="row">Tipo de tratamiento</th><td>Mixto</td></tr>
		<tr><th scope="row">Categoría de destinatarios</th><td>Cumplimiento de las obligaciones legales.</td></tr>
	</tbody>
</table>`;

const bodyHtmlEs = `
<p><strong>{{applicant}}</strong>, como solicitante del nombre de dominio <strong>{{domains}}</strong> (en adelante, "el Solicitante") declara que:</p>
<ul>
	<li>Autoriza al AGENTE REGISTRADOR <strong>REALTIME REGISTER B.V.</strong> (en lo sucesivo, "el AGENTE REGISTRADOR") para actuar por su cuenta ante Red.es (en adelante, indistintamente, "el Registro" o "la Autoridad de Asignación"), y para realizar todas las actuaciones necesarias para la asignación y renovación del nombre de dominio <strong>{{domains}}</strong> (en adelante, "el Nombre de Dominio"), incluyendo la recepción de las correspondientes comunicaciones.</li>
	<li>Autoriza al AGENTE REGISTRADOR para actuar en cuantas actuaciones sean necesarias para realizar por su cuenta los pagos correspondientes a la asignación y renovación de los Nombres de Dominio, que solicita se realice por años sucesivos.</li>
	<li>El AGENTE REGISTRADOR le ha informado adecuadamente y está al corriente de las normas y procedimientos vigentes, términos y condiciones, tarifas y forma de pago y requisitos técnicos establecidos para el registro de nombres de dominio bajo ".es" con la mediación de un AGENTE REGISTRADOR acreditado, y los acepta en su totalidad. En particular, el Solicitante declara conocer las normas, procedimientos, términos y condiciones para el Registro de un Nombre de Dominio bajo ".es", cuyo contenido se encuentra disponible en: <a href="https://www.dominios.es/en/sobre-dominios/normativa" target="_blank" rel="noopener noreferrer">https://www.dominios.es/en/sobre-dominios/normativa</a></li>
	<li>Conoce que el incumplimiento de estas normas, en los casos en que esté así expresamente establecido, supondrá la pérdida del nombre de dominio y su posible reasignación desde ese mismo momento para su registro a favor de un solicitante que esté legitimado para ello.</li>
	<li>Los datos facilitados en la presente solicitud son ciertos, salvo error u omisión de buena fe.</li>
	<li>Se compromete a mantener siempre actualizada la información facilitada en esta solicitud, comunicando cualquier cambio al AGENTE REGISTRADOR, que informará a Red.es siempre que haya modificaciones en cualquiera de los datos que deben ser remitidos al Registro. El incumplimiento de esta obligación puede dar lugar a que el Nombre de Dominio sea dado de baja (por ejemplo, por imposibilidad de comunicar con las personas que figuran como responsables del nombre de dominio, al no haber comunicado en la forma establecida el cambio de sus datos de contacto o cambios de responsables).</li>
	<li>Asume que Red.es, en la tramitación de las diferentes actuaciones relativas a la asignación y renovación del Nombre de Dominio, actuará tomando en consideración los datos comunicados por el Solicitante en la forma señalada en el apartado anterior.</li>
	<li>Es consciente y asume que cualquier falsedad en los datos consignados en la presente solicitud podrá ser causa de desestimación de la misma o, si el Nombre de Dominio ya se hubiera asignado, podrá ser causa de baja del Nombre y que, en este caso, el Nombre de Dominio estará disponible para su eventual registro por parte de otro solicitante legitimado.</li>
	<li>Es consciente y asume que, una vez el Registro comunique al AGENTE REGISTRADOR que el Nombre de Dominio puede ser asignado o renovado por cumplir los requisitos establecidos al efecto, el AGENTE REGISTRADOR está obligado a realizar, por cuenta del Solicitante y en los plazos establecidos, el pago de las cantidades correspondientes por asignación o, en su caso, renovación, y que, en caso de impago o pago insuficiente tras los plazos establecidos, el Nombre de Dominio pasará a estar disponible desde ese mismo momento para su registro a favor de un solicitante legitimado, sin que Red.es pueda asumir responsabilidad alguna por las consecuencias del incumplimiento de las obligaciones del AGENTE REGISTRADOR para con el Solicitante.</li>
	<li>Es consciente y asume que el AGENTE REGISTRADOR ejerce una función de intermediación en la asignación de nombres de dominio bajo el ".es", y es el único y exclusivo responsable del cumplimiento de las obligaciones estipuladas en el contrato de intermediación para la asignación de nombres de dominio. El Solicitante se considera informado de esta circunstancia y renuncia expresamente a cualquier acción o reclamación frente a Red.es derivada del incumplimiento de las obligaciones del AGENTE REGISTRADOR.</li>
	<li>Es consciente y asume que, en caso de grave negligencia técnica, un nombre de dominio registrado puede ser dado de baja de forma temporal o definitiva.</li>
	<li>De acuerdo con su conocimiento, el uso del Nombre de Dominio no viola los derechos de terceros.</li>
	<li>Es consciente y asume que la asignación y registro del Nombre de Dominio a su favor le confiere exclusivamente el derecho a su utilización, en los términos previstos en la normativa aplicable, a efectos de direccionamiento en el sistema de nombres de dominio de Internet, y que cualquier disputa sobre los derechos de uso de un determinado nombre de dominio habrá de ser resuelta entre las partes contendientes utilizando los cauces legalmente establecidos al efecto.</li>
	<li>Es consciente y asume que la persona de contacto administrativo señalada en la solicitud y que firma el presente documento con capacidad suficiente de representación a tales efectos, es la responsable de cualquier problema relacionado con los derechos de uso del nombre de dominio, lo cual es conocido y aceptado por él.</li>
	<li>Declara que todas las entidades y personas relacionadas en la presente solicitud conocen, de acuerdo con lo establecido por el Reglamento (UE) 2016/679, del Parlamento Europeo y del Consejo, de 27 de abril de 2016, relativo a la protección de las personas físicas en lo que respecta al tratamiento de datos personales y la libre circulación de estos datos y por el que se deroga la Directiva 95/46/CE (Reglamento General de Protección de Datos), la siguiente información básica sobre la protección de sus datos personales:</li>
</ul>
<h3>Información básica sobre protección de datos</h3>
${ dataProtectionTableEs }
<ul>
	<li>Declara que todas las entidades y personas relacionadas en la presente solicitud consienten expresamente que los datos personales que han sido facilitados al AGENTE REGISTRADOR y los que constan en el presente documento sean procesados por Red.es con las siguientes finalidades:
		<ul>
			<li>Registro de los datos necesarios para la asignación, operación y renovación del nombre de dominio.</li>
			<li>Consignación en las bases internas para la gestión del Registro ".es" (Dominios .es).</li>
			<li>Con otras Administraciones Públicas con las que Red.es suscriba convenios.</li>
		</ul>
		<p>Todo ello de acuerdo con los términos establecidos en las Normas y Procedimientos para el Registro de un Nombre de Dominio bajo ".es".</p>
	</li>
	<li>Declara que todas las entidades y personas relacionadas en la presente solicitud conocen que, de acuerdo con la Disposición Adicional Decimoctava de la Ley 14/2000, de 29 de diciembre, de Medidas fiscales, administrativas y del orden social, la Entidad Pública Empresarial Red.es dará publicidad a los procedimientos de asignación y registro de nombres de dominio ".es" que se adopten y que ello supondrá que el nombre y apellidos, en el caso de las personas físicas, la razón social, en el caso de las personas jurídicas, y el correo electrónico en todos los casos, se comunicarán a través de WHOIS, protocolo TCP de consulta/respuesta respecto de dichos datos, así como mediante aquellas herramientas que Red.es habilite para la consulta de dichos datos.</li>
	<li>Conoce y asume que los derechos de acceso, rectificación, supresión y portabilidad de sus datos y la limitación u oposición a su tratamiento podrán ejercerse frente a <strong>REALTIME REGISTER B.V.</strong> en su domicilio sito en Burgemeester Drijbersingel 51 (8021 JB), Zwolle, The Netherlands, o directamente ante Red.es en cuanto que responsable del tratamiento. Los derechos de cancelación y oposición únicamente podrán ejercerse previa la renuncia al nombre de dominio solicitado, puesto que el tratamiento de los datos personales por parte de Red.es es necesario para la asignación y renovación del nombre de dominio.</li>
</ul>
<p>RED.ES, con dirección en www.red.es, observará en el tratamiento de los datos personales de las personas y entidades mencionadas lo dispuesto en el Reglamento (UE) 679/2016, sin utilizarlos para otra finalidad distinta que la conducente a la asignación y renovación del nombre de dominio y a su publicidad en los términos anteriormente descritos. Los datos personales procesados por Red.es no serán transferidos o accesibles por ningún otro tercero, salvo si dicha transferencia fuere requerida por la ley, por una disposición reglamentaria o por un fallo judicial, o si esta divulgación es necesaria para garantizar la protección y defensa de sus derechos. Red.es, en el ejercicio de su actividad como registro del indicativo ".es", tiene la facultad para subcontratar servicios relacionados con la correcta operación del registro, tales como desarrollos, explotación, atención a Agentes Registradores y Usuarios Finales, Seguridad, etc. En dichas circunstancias los subcontratistas de Red.es quedarán sometidos a las mismas cláusulas de confidencialidad y tratamiento de los datos personales.</p>
<p>En Burgemeester Drijbersingel 51 (8021 JB), Zwolle, The Netherlands, a <strong>{{date}}</strong>.</p>
<p><strong>Firma (Contacto administrativo):</strong><br />D./Dña. <strong>{{admin_contact_name}}</strong>, con DNI/pasaporte <strong>{{admin_contact_id}}</strong></p>
`;

const dataProtectionTableEn = `
<table>
	<thead>
		<tr><th scope="col">Field</th><th scope="col">Content</th></tr>
	</thead>
	<tbody>
		<tr><th scope="row">Name of processing</th><td>DOMINIOS.ES</td></tr>
		<tr><th scope="row">Purposes of processing</th><td><p>Management of relations for the assignment of domain names and relations with domain holders and/or authorised registrars.</p><p>Reuse of information associated with ".es" domain names in accordance with Law 37/2007, of 16 November, on the reuse of public sector information.</p><p>Preparation of reports, studies and aggregate analyses on the use of ".es" domains by Red.es or, jointly, with other Spanish or international organisations or entities whose purposes include the management of domain names.</p><p>Collaboration agreements with other Spanish Public Administrations or entities, as well as with international bodies or organisations, with which Red.es enters into agreements within the scope of its competences.</p><p>Studies, archiving in the public interest, scientific or historical research or statistical purposes related to the activity of the Registry.</p></td></tr>
		<tr><th scope="row">Data controller</th><td>Red.es: Edificio Bronce, Plaza Manuel Gómez Moreno, s/n, 28020 Madrid. Phone: 901100167. Email: protecciondedatos@red.es</td></tr>
		<tr><th scope="row">Data processor</th><td>In the management of dominios.es, data processors have been identified, which may be consulted as an annex to this record.</td></tr>
		<tr><th scope="row">Data Protection Officer</th><td>Phone: 901100167. Email: protecciondedatos@red.es</td></tr>
		<tr><th scope="row">Data categories</th><td>Names and surnames, identity document, address, telephone and email. Professional information.</td></tr>
		<tr><th scope="row">Data subjects</th><td>Registrars and applicants. Holders of .es domains.</td></tr>
		<tr><th scope="row">Department involved</th><td>Dominios</td></tr>
		<tr><th scope="row">Legal basis</th><td><p>Maintenance of contractual relations with Registrars and with domain holders.</p><p>Legitimate interest of Red.es and of third parties in knowing the degree of use and purposes of .es domains.</p></td></tr>
		<tr><th scope="row">Retention period</th><td>10 years after termination of the contract</td></tr>
		<tr><th scope="row">Security measures</th><td><p>The security measures implemented at the public business entity Red.es, M.P. correspond to those set out in Annex II (Security measures) of Royal Decree 311/2022, of 3 May, regulating the National Security Framework in the field of Electronic Administration, and in addition the security controls of the Information Security Management System based on the UNE-EN ISO/IEC 27001 standard have been implemented.</p><p>For third parties maintaining a contractual relationship with the Registry, the security measures shall be the same as or equivalent to those indicated above.</p></td></tr>
		<tr><th scope="row">International transfers</th><td><p>International transfers are contemplated with entities maintaining a contractual relationship with the Registry and for reasons of public interest (security of the Registry).</p><p>Details of these contractual relationships may be consulted as an annex to this record.</p></td></tr>
		<tr><th scope="row">Exercise of rights</th><td>You may exercise your rights of access, rectification, erasure and portability of your data, and restriction of or objection to its processing, by completing a form available at the Red.es electronic office and addressed to the Data Controller (Red.es): <a href="https://sede.red.gob.es/" target="_blank" rel="noopener noreferrer">https://sede.red.gob.es/</a> or protecciondedatos@red.es</td></tr>
		<tr><th scope="row">Type of processing</th><td>Mixed</td></tr>
		<tr><th scope="row">Categories of recipients</th><td>Compliance with legal obligations.</td></tr>
	</tbody>
</table>`;

const bodyHtmlEn = `
<p><strong>{{applicant}}</strong>, as applicant for the domain name <strong>{{domains}}</strong> (hereinafter, "the Applicant"), hereby declares that:</p>
<ul>
	<li>The REGISTRAR <strong>REALTIME REGISTER B.V.</strong> (hereinafter, "the REGISTRAR") is authorised to act on its behalf before Red.es (hereinafter, either "the Registry" or "the Assignment Authority"), and to take all actions necessary for the assignment and renewal of the domain name <strong>{{domains}}</strong> (hereinafter, "the Domain Name"), including receiving the corresponding notifications.</li>
	<li>The REGISTRAR is authorised to take any action necessary to make, on its behalf, the payments corresponding to the assignment and renewal of the Domain Name, which it requests be carried out for successive years.</li>
	<li>It has been duly informed by the REGISTRAR and is aware of the applicable rules and procedures, terms and conditions, fees and payment methods and technical requirements established for the registration of ".es" domain names through an accredited REGISTRAR, and accepts them in their entirety. In particular, the Applicant declares that it is aware of the rules, procedures, terms and conditions for the registration of a Domain Name under ".es", the content of which is available at: <a href="https://www.dominios.es/en/sobre-dominios/normativa" target="_blank" rel="noopener noreferrer">https://www.dominios.es/en/sobre-dominios/normativa</a></li>
	<li>It understands that failure to comply with these rules shall, in the cases where this is expressly established, result in the loss of the domain name and its possible reassignment, from that very moment, for registration in favour of an eligible applicant.</li>
	<li>The data provided in this application are true, except for errors or omissions in good faith.</li>
	<li>It undertakes to keep the information provided in this application up to date at all times, notifying any change to the REGISTRAR, which will inform Red.es whenever there is a modification to any of the data that must be submitted to the Registry. Failure to fulfil this obligation may result in the cancellation of the Domain Name (for example, because it is impossible to contact the persons listed as responsible for the domain name, as changes to their contact details or to the responsible persons were not notified in the established manner).</li>
	<li>It accepts that Red.es, in processing the various actions relating to the assignment and renewal of the Domain Name, will act on the basis of the data communicated by the Applicant in the manner indicated in the previous paragraph.</li>
	<li>It understands and accepts that any false data provided in this application may be grounds for its rejection or, if the Domain Name has already been assigned, may be grounds for its cancellation, and that in such case the Domain Name will be available for registration by another eligible applicant.</li>
	<li>It understands and accepts that, once the Registry notifies the REGISTRAR that the Domain Name may be assigned or renewed because the requirements established for that purpose have been met, the REGISTRAR is obliged to pay, on behalf of the Applicant and within the established deadlines, the amounts corresponding to the assignment or, where applicable, renewal, and that in the event of non-payment or insufficient payment after the established deadlines, the Domain Name will become available from that very moment for registration in favour of an eligible applicant, with Red.es assuming no liability whatsoever for the consequences of the REGISTRAR's failure to fulfil its obligations towards the Applicant.</li>
	<li>It understands and accepts that the REGISTRAR performs an intermediary role in the assignment of ".es" domain names and is solely and exclusively responsible for compliance with the obligations stipulated in the intermediation contract for the assignment of domain names. The Applicant is deemed to have been informed of this circumstance and expressly waives any action or claim against Red.es arising from the REGISTRAR's failure to fulfil its obligations.</li>
	<li>It understands and accepts that, in the event of serious technical negligence, a registered domain name may be cancelled temporarily or permanently.</li>
	<li>To the best of its knowledge, the use of the Domain Name does not infringe the rights of third parties.</li>
	<li>It understands and accepts that the assignment and registration of the Domain Name in its favour confers exclusively the right to use it, under the terms set out in the applicable legislation, for addressing purposes within the Internet domain name system, and that any dispute over the rights of use of a given domain name must be resolved between the disputing parties through the legally established channels.</li>
	<li>It understands and accepts that the administrative contact person named in the application, who signs this document with sufficient authority of representation for these purposes, is responsible for any issue relating to the rights of use of the domain name, which is known and accepted by that person.</li>
	<li>It declares that all entities and persons named in this application are aware, in accordance with Regulation (EU) 2016/679 of the European Parliament and of the Council of 27 April 2016 on the protection of natural persons with regard to the processing of personal data and on the free movement of such data, and repealing Directive 95/46/EC (General Data Protection Regulation), of the following basic information on the protection of their personal data:</li>
</ul>
<h3>Basic information on data protection</h3>
${ dataProtectionTableEn }
<ul>
	<li>It declares that all entities and persons named in this application expressly consent to the personal data provided to the REGISTRAR and those contained in this document being processed by Red.es for the following purposes:
		<ul>
			<li>Recording of the data necessary for the assignment, operation and renewal of the domain name.</li>
			<li>Entry in the internal databases for the management of the ".es" Registry (Dominios .es).</li>
			<li>Sharing with other Public Administrations with which Red.es enters into agreements.</li>
		</ul>
		<p>All in accordance with the terms established in the Rules and Procedures for the Registration of a Domain Name under ".es".</p>
	</li>
	<li>It declares that all entities and persons named in this application are aware that, in accordance with the Eighteenth Additional Provision of Law 14/2000, of 29 December, on fiscal, administrative and social measures, the public business entity Red.es will publicise the procedures for the assignment and registration of ".es" domain names that are adopted, and that this will entail that the name and surnames, in the case of natural persons, the company name, in the case of legal persons, and the email address in all cases, will be communicated via WHOIS, a TCP query/response protocol for such data, as well as through any tools that Red.es makes available for querying such data.</li>
	<li>It is aware and accepts that the rights of access, rectification, erasure and portability of data, and restriction of or objection to its processing, may be exercised before <strong>REALTIME REGISTER B.V.</strong> at its registered office at Burgemeester Drijbersingel 51 (8021 JB), Zwolle, The Netherlands, or directly before Red.es as data controller. The rights of erasure and objection may only be exercised after waiving the requested domain name, since the processing of personal data by Red.es is necessary for the assignment and renewal of the domain name.</li>
</ul>
<p>RED.ES, with address at www.red.es, shall comply with Regulation (EU) 679/2016 in the processing of the personal data of the persons and entities mentioned, without using them for any purpose other than the assignment and renewal of the domain name and its publication under the terms described above. The personal data processed by Red.es will not be transferred to or made accessible to any other third party, unless such transfer is required by law, by a regulatory provision or by a court decision, or if such disclosure is necessary to guarantee the protection and defence of its rights. Red.es, in carrying out its activity as registry for the ".es" code, may subcontract services related to the proper operation of the registry, such as development, operations, support to Registrars and End Users, security, etc. In such circumstances, Red.es's subcontractors shall be subject to the same confidentiality and personal data processing clauses.</p>
<p>At Burgemeester Drijbersingel 51 (8021 JB), Zwolle, The Netherlands, on <strong>{{date}}</strong>.</p>
<p><strong>Signature (Administrative Contact):</strong><br />Mr/Ms <strong>{{admin_contact_name}}</strong>, ID / passport no. <strong>{{admin_contact_id}}</strong></p>
`;

export type RedEsAgreementLanguage = 'es' | 'en';

/**
 * Spanish is the legally binding text and the one shown by default; English is available on
 * request for information only.
 */
export function getRedEsAgreementTemplate(
	language: RedEsAgreementLanguage
): RedEsAgreementTemplate {
	if ( language === 'es' ) {
		return {
			version: RED_ES_AGREEMENT_VERSION,
			title: 'Anexo III del Contrato de Agente Registrador',
			body_html: bodyHtmlEs,
		};
	}
	return {
		version: RED_ES_AGREEMENT_VERSION,
		title: 'Annex III of the Registrar Contract',
		body_html: bodyHtmlEn,
	};
}

function escapeHtml( value: string ): string {
	return value
		.replace( /&/g, '&amp;' )
		.replace( /</g, '&lt;' )
		.replace( />/g, '&gt;' )
		.replace( /"/g, '&quot;' )
		.replace( /'/g, '&#39;' );
}

/**
 * Replaces the `{{placeholders}}` of the agreement body with the escaped customer values.
 */
export function interpolateRedEsAgreement(
	bodyHtml: string,
	values: RedEsAgreementValues,
	date: string
): string {
	const placeholders: Record< string, string > = {
		applicant: escapeHtml( values.applicant_name ),
		domains: values.domains.map( escapeHtml ).join( ', ' ),
		admin_contact_name: escapeHtml( values.applicant_name ),
		admin_contact_id: escapeHtml( values.applicant_identification_number ),
		date: escapeHtml( date ),
	};
	return bodyHtml.replace(
		/\{\{(\w+)\}\}/g,
		( match, key: string ) => placeholders[ key ] ?? match
	);
}
