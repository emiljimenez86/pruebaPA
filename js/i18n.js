/**
 * Idiomas: es (por defecto), en, pt, ru. Preferencia en localStorage (perez-araujo-lang).
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'perez-araujo-lang';
  var FALLBACK = 'es';

  var M = {
    es: {
      'meta.title_index': 'Inmobiliaria Pérez Araujo | Venta y arriendo',
      'meta.title_publicar': 'Publicar propiedad | Inmobiliaria Pérez Araujo',
      'meta.title_propiedad': 'Propiedad | Inmobiliaria Pérez Araujo',
      'meta.title_politica': 'Política de privacidad | Inmobiliaria Pérez Araujo',
      'lang.label': 'Idioma',
      'nav.home': 'Inicio',
      'nav.publish': 'Publicar',
      'nav.about': 'Quiénes somos',
      'header.logo_aria': 'Inicio',
      'hero.title': 'Tu lugar, tu momento ¡Encuentra el tuyo!',
      'hero.subtitle': 'Venta y arriendo por ciudad y municipio',
      'video_youtube.aria': 'Video',
      'video_youtube.title_iframe': 'Video de Inmobiliaria Pérez Araujo',
      'buscar.title': 'Buscar',
      'buscar.aria': 'Buscar propiedades',
      'label.country': 'País',
      'label.department': 'Departamento',
      'label.municipality': 'Municipio',
      'label.type': 'Tipo',
      'filtro_pais_list_aria': 'Seleccionar país',
      'opt.all_dept': 'Todos los departamentos',
      'opt.all_mun': 'Todos los municipios',
      'opt.type_any': 'Venta o arriendo',
      'opt.type_sale': 'Venta',
      'opt.type_rent': 'Arriendo',
      'opt.type_daily': 'Arriendo por día',
      'btn.search': 'Buscar',
      'props.title': 'Propiedades',
      'props.aria': 'Propiedades',
      'props.info_none': 'No se encontraron propiedades.',
      'props.info_one': '1 propiedad.',
      'props.info_many': '{n} propiedades.',
      'props.empty_filters': 'No hay propiedades con esos filtros.',
      'props.empty_cta': 'Publicar una propiedad',
      'video_local.aria': 'Video institucional',
      'video_local.fallback': 'Tu navegador no admite reproducción de video en la página.',
      'video_embed.open_tab': 'Abrir video en nueva pestaña',
      'about.title': 'Quiénes somos',
      'about.text': 'Inmobiliaria Pérez Araujo es tu aliada en la búsqueda del hogar ideal. Nos especializamos en venta y arriendo de propiedades en Colombia, con atención personalizada y un equipo comprometido en ayudarte a encontrar la mejor opción o a publicar tu inmueble.',
      'about.cta': '¿Tienes alguna consulta o quieres publicar una propiedad?',
      'contact.wa_span': 'Escríbenos por WhatsApp',
      'ios.title': 'Para instalar esta app en tu iPhone:',
      'ios.li1': 'Toca el botón Compartir ⬆️ en Safari.',
      'ios.li2': 'Elige <strong>Añadir a pantalla de inicio</strong>.',
      'ios.li3': 'Confirma tocando <strong>Añadir</strong>.',
      'ios.close': 'Cerrar',
      'install.btn': 'Instalar app',
      'install.aria': 'Instalar aplicación',
      'footer.rights': '2026 Inmobiliaria Pérez Araujo. Todos los derechos reservados a Emil Jiménez Ortiz — Desarrollador Web',
      'tarjeta.fotos_mas': '+{n} fotos',
      'tarjeta.ver_video': '🎬 Ver video',
      'tarjeta.venta': 'Venta',
      'tarjeta.arriendo': 'Arriendo',
      'tarjeta.por_dia': ' por día',
      'tarjeta.codigo': 'Código Inmueble: ',
      'tarjeta.ver_mas': 'Ver más fotos y video',
      'tarjeta.fecha_in': 'Fecha de entrada',
      'tarjeta.fecha_out': 'Fecha de salida',
      'tarjeta.adultos': 'Adultos',
      'tarjeta.ninos': 'Niños',
      'tarjeta.whatsapp': 'Consultar por WhatsApp',
      'tarjeta.sin_ubicacion': 'Sin ubicación',
      'tarjeta.consultar_precio': 'Consultar',
      'detalle.cargando': 'Cargando...',
      'detalle.no_encontrado': 'No se encontró la propiedad.',
      'detalle.volver': '← Volver al listado',
      'detalle.galeria_aria': 'Galería de fotos',
      'detalle.toca_amp': 'Toca para ver más grande',
      'detalle.video': 'Video',
      'detalle.ver_video_ext': '🎬 Ver video',
      'detalle.whatsapp': 'Consultar por WhatsApp',
      'detalle.foto_ant': 'Foto anterior',
      'detalle.foto_sig': 'Siguiente foto',
      'detalle.ir_foto': 'Ir a foto {n}',
      'detalle.cerrar': 'Cerrar',
      'detalle.amp_ant': 'Anterior',
      'detalle.amp_sig': 'Siguiente',
      'detalle.codigo': 'Código Inmueble: ',
      'detalle.tap_more': 'Toca para ampliar',
      'msg.wa_general': 'Hola, entré desde la web de Inmobiliaria Pérez Araujo. Me gustaría recibir información sobre propiedades (venta o arriendo).',
      'msg.wa_prop_sale': 'Hola, me interesa esta propiedad para comprar:\n\n',
      'msg.wa_prop_rent': 'Hola, me interesa esta propiedad para arrendar:\n\n',
      'msg.wa_prop_footer': '\n\nVi el anuncio en la Aplicación Web de Inmobiliaria Pérez Araujo.',
      'msg.wa_prop_codigo': 'Código Inmueble: ',
      'msg.wa_dia': 'Hola, me interesa esta propiedad para arrendar por día:\n\n',
      'msg.wa_dia_line_in': '*Fecha de entrada:* ',
      'msg.wa_dia_line_out': '*Fecha de salida:* ',
      'msg.wa_dia_adultos': '*Adultos:* ',
      'msg.wa_dia_ninos': '*Niños:* ',
      'msg.wa_sin_codigo': 'Sin código',
      'pub.hero_title': 'Publicar propiedad',
      'pub.hero_sub': 'Completa los datos y te llevamos a WhatsApp para que nos envíes tu aviso.',
      'pub.label_nombre': 'Nombre completo *',
      'pub.ph_nombre': 'Ej: Juan Pérez',
      'pub.label_tel': 'Número de celular *',
      'pub.ph_tel': 'Ej: 300 123 4567',
      'pub.label_email': 'E-mail *',
      'pub.ph_email': 'Ej: correo@ejemplo.com',
      'pub.label_pais': 'País *',
      'pub.label_dept': 'Departamento',
      'pub.label_mun': 'Municipio',
      'pub.opt_sel_dept': 'Seleccione departamento',
      'pub.opt_sel_mun': 'Seleccione municipio',
      'pub.pais_list_aria': 'Seleccionar país',
      'pub.label_zona': 'Zona / Sector / Barrio',
      'pub.ph_zona': 'Ej: Centro, Poblado, etc.',
      'pub.label_tipo_inm': 'Tipo de inmueble *',
      'pub.opt_tipo_inm': 'Seleccione tipo de inmueble',
      'pub.label_valor': 'Valor estimado',
      'pub.ph_valor': 'Ej: 150.000.000 o 1.200.000/mes',
      'pub.label_mensaje': 'Déjanos tu mensaje *',
      'pub.ph_mensaje': 'Describe la propiedad, características, contacto preferido...',
      'pub.politica': 'Acepto la ',
      'pub.politica_link': 'Política de tratamiento de datos',
      'pub.politica_fin': ' *',
      'pub.nota': 'Al enviar se abrirá WhatsApp con un mensaje listo. Envíalo para que publiquemos tu aviso.',
      'pub.btn': 'Enviar por WhatsApp',
      'opt.todos': 'Todos',
      'pub.alert_politica': 'Debes aceptar la Política de tratamiento de datos para continuar.',
      'pub.wa_1': 'Hola, quiero *publicar* una propiedad en la web de Inmobiliaria Pérez Araujo.',
      'pub.wa_name': '*Nombre:* ',
      'pub.wa_cell': '*Celular:* ',
      'pub.wa_email': '*E-mail:* ',
      'pub.wa_country': '*País:* ',
      'pub.wa_dept': '*Departamento:* ',
      'pub.wa_mun': '*Municipio:* ',
      'pub.wa_zone': '*Zona / Sector / Barrio:* ',
      'pub.wa_type': '*Tipo de inmueble:* ',
      'pub.wa_price': '*Valor estimado:* ',
      'pub.wa_msg': '*Mensaje:*',
      'pub.wa_valor_def': 'A convenir',
      'pub.wa_footer': '_(Enviado desde el formulario Publicar de la web)_',
      'pub.ph_sel': 'Seleccione',
      'pwa.alert_android': 'No se puede usar el instalador automático aquí.\n\nPara añadir al inicio: menú del navegador (⋮) → «Añadir a pantalla de inicio» o «Instalar aplicación».',
      'pwa.alert_other': 'Instalación disponible en Chrome para Android. En este dispositivo usa la web en el navegador.'
    },
    en: {
      'meta.title_index': 'Pérez Araujo Real Estate | Sale and rent',
      'meta.title_publicar': 'List a property | Pérez Araujo Real Estate',
      'meta.title_propiedad': 'Property | Pérez Araujo Real Estate',
      'meta.title_politica': 'Privacy policy | Pérez Araujo Real Estate',
      'lang.label': 'Language',
      'nav.home': 'Home',
      'nav.publish': 'List property',
      'nav.about': 'About us',
      'header.logo_aria': 'Home',
      'hero.title': 'Your place, your moment — find yours!',
      'hero.subtitle': 'Sale and rent by city and municipality',
      'video_youtube.aria': 'Video',
      'video_youtube.title_iframe': 'Pérez Araujo Real Estate video',
      'buscar.title': 'Search',
      'buscar.aria': 'Search properties',
      'label.country': 'Country',
      'label.department': 'Department / State',
      'label.municipality': 'Municipality / City',
      'label.type': 'Type',
      'filtro_pais_list_aria': 'Select country',
      'opt.all_dept': 'All departments',
      'opt.all_mun': 'All municipalities',
      'opt.type_any': 'Sale or rent',
      'opt.type_sale': 'Sale',
      'opt.type_rent': 'Rent',
      'opt.type_daily': 'Daily rent',
      'btn.search': 'Search',
      'props.title': 'Properties',
      'props.aria': 'Properties',
      'props.info_none': 'No properties found.',
      'props.info_one': '1 property.',
      'props.info_many': '{n} properties.',
      'props.empty_filters': 'No properties match these filters.',
      'props.empty_cta': 'List a property',
      'video_local.aria': 'Institutional video',
      'video_local.fallback': 'Your browser does not support embedded video.',
      'video_embed.open_tab': 'Open video in new tab',
      'about.title': 'About us',
      'about.text': 'Pérez Araujo Real Estate is your partner in finding the ideal home. We specialize in sale and rent of properties in Colombia, with personalized service and a team committed to helping you find the best option or list your property.',
      'about.cta': 'Have a question or want to list a property?',
      'contact.wa_span': 'Message us on WhatsApp',
      'ios.title': 'To install this app on your iPhone:',
      'ios.li1': 'Tap the Share ⬆️ button in Safari.',
      'ios.li2': 'Choose <strong>Add to Home Screen</strong>.',
      'ios.li3': 'Confirm by tapping <strong>Add</strong>.',
      'ios.close': 'Close',
      'install.btn': 'Install app',
      'install.aria': 'Install application',
      'footer.rights': '2026 Pérez Araujo Real Estate. All rights reserved — Emil Jiménez Ortiz, Web Developer',
      'tarjeta.fotos_mas': '+{n} photos',
      'tarjeta.ver_video': '🎬 Watch video',
      'tarjeta.venta': 'Sale',
      'tarjeta.arriendo': 'Rent',
      'tarjeta.por_dia': ' per day',
      'tarjeta.codigo': 'Property code: ',
      'tarjeta.ver_mas': 'More photos and video',
      'tarjeta.fecha_in': 'Check-in',
      'tarjeta.fecha_out': 'Check-out',
      'tarjeta.adultos': 'Adults',
      'tarjeta.ninos': 'Children',
      'tarjeta.whatsapp': 'Contact via WhatsApp',
      'tarjeta.sin_ubicacion': 'No location',
      'tarjeta.consultar_precio': 'Ask',
      'detalle.cargando': 'Loading...',
      'detalle.no_encontrado': 'Property not found.',
      'detalle.volver': '← Back to listings',
      'detalle.galeria_aria': 'Photo gallery',
      'detalle.toca_amp': 'Tap to enlarge',
      'detalle.video': 'Video',
      'detalle.ver_video_ext': '🎬 Watch video',
      'detalle.whatsapp': 'Contact via WhatsApp',
      'detalle.foto_ant': 'Previous photo',
      'detalle.foto_sig': 'Next photo',
      'detalle.ir_foto': 'Go to photo {n}',
      'detalle.cerrar': 'Close',
      'detalle.amp_ant': 'Previous',
      'detalle.amp_sig': 'Next',
      'detalle.codigo': 'Property code: ',
      'detalle.tap_more': 'Tap to enlarge',
      'msg.wa_general': 'Hello, I came from the Pérez Araujo Real Estate website. I would like information about properties (sale or rent).',
      'msg.wa_prop_sale': 'Hello, I am interested in this property to buy:\n\n',
      'msg.wa_prop_rent': 'Hello, I am interested in this property to rent:\n\n',
      'msg.wa_prop_footer': '\n\nI saw the listing on the Pérez Araujo Real Estate web app.',
      'msg.wa_prop_codigo': 'Property code: ',
      'msg.wa_dia': 'Hello, I am interested in this property for daily rent:\n\n',
      'msg.wa_dia_line_in': '*Check-in:* ',
      'msg.wa_dia_line_out': '*Check-out:* ',
      'msg.wa_dia_adultos': '*Adults:* ',
      'msg.wa_dia_ninos': '*Children:* ',
      'msg.wa_sin_codigo': 'No code',
      'pub.hero_title': 'List a property',
      'pub.hero_sub': 'Fill in the details and we will open WhatsApp so you can send us your listing.',
      'pub.label_nombre': 'Full name *',
      'pub.ph_nombre': 'E.g.: John Smith',
      'pub.label_tel': 'Mobile number *',
      'pub.ph_tel': 'E.g.: 300 123 4567',
      'pub.label_email': 'E-mail *',
      'pub.ph_email': 'E.g.: name@example.com',
      'pub.label_pais': 'Country *',
      'pub.label_dept': 'Department / State',
      'pub.label_mun': 'Municipality / City',
      'pub.opt_sel_dept': 'Select department',
      'pub.opt_sel_mun': 'Select municipality',
      'pub.pais_list_aria': 'Select country',
      'pub.label_zona': 'Area / Neighborhood',
      'pub.ph_zona': 'E.g.: Downtown, etc.',
      'pub.label_tipo_inm': 'Property type *',
      'pub.opt_tipo_inm': 'Select property type',
      'pub.label_valor': 'Estimated value',
      'pub.ph_valor': 'E.g.: 150,000,000 or 1,200,000/month',
      'pub.label_mensaje': 'Your message *',
      'pub.ph_mensaje': 'Describe the property, features, preferred contact...',
      'pub.politica': 'I accept the ',
      'pub.politica_link': 'data processing policy',
      'pub.politica_fin': ' *',
      'pub.nota': 'Submitting will open WhatsApp with a ready message. Send it so we can publish your listing.',
      'pub.btn': 'Send via WhatsApp',
      'opt.todos': 'All',
      'pub.alert_politica': 'You must accept the data processing policy to continue.',
      'pub.wa_1': 'Hello, I want to *list* a property on the Pérez Araujo Real Estate website.',
      'pub.wa_name': '*Name:* ',
      'pub.wa_cell': '*Mobile:* ',
      'pub.wa_email': '*E-mail:* ',
      'pub.wa_country': '*Country:* ',
      'pub.wa_dept': '*Department / State:* ',
      'pub.wa_mun': '*Municipality / City:* ',
      'pub.wa_zone': '*Area / Neighborhood:* ',
      'pub.wa_type': '*Property type:* ',
      'pub.wa_price': '*Estimated value:* ',
      'pub.wa_msg': '*Message:*',
      'pub.wa_valor_def': 'To be agreed',
      'pub.wa_footer': '_(Sent from the List a property form on the website)_',
      'pub.ph_sel': 'Select',
      'pwa.alert_android': 'The automatic installer cannot be used here.\n\nTo add to home: browser menu (⋮) → «Add to Home screen» or «Install app».',
      'pwa.alert_other': 'Installation is available in Chrome for Android. On this device, use the site in your browser.'
    },
    pt: {
      'meta.title_index': 'Imobiliária Pérez Araujo | Venda e aluguel',
      'meta.title_publicar': 'Publicar imóvel | Imobiliária Pérez Araujo',
      'meta.title_propiedad': 'Imóvel | Imobiliária Pérez Araujo',
      'meta.title_politica': 'Política de privacidade | Imobiliária Pérez Araujo',
      'lang.label': 'Idioma',
      'nav.home': 'Início',
      'nav.publish': 'Publicar',
      'nav.about': 'Quem somos',
      'header.logo_aria': 'Início',
      'hero.title': 'Seu lugar, seu momento — encontre o seu!',
      'hero.subtitle': 'Venda e aluguel por cidade e município',
      'video_youtube.aria': 'Vídeo',
      'video_youtube.title_iframe': 'Vídeo da Imobiliária Pérez Araujo',
      'buscar.title': 'Buscar',
      'buscar.aria': 'Buscar imóveis',
      'label.country': 'País',
      'label.department': 'Departamento',
      'label.municipality': 'Município',
      'label.type': 'Tipo',
      'filtro_pais_list_aria': 'Selecionar país',
      'opt.all_dept': 'Todos os departamentos',
      'opt.all_mun': 'Todos os municípios',
      'opt.type_any': 'Venda ou aluguel',
      'opt.type_sale': 'Venda',
      'opt.type_rent': 'Aluguel',
      'opt.type_daily': 'Aluguel por dia',
      'btn.search': 'Buscar',
      'props.title': 'Imóveis',
      'props.aria': 'Imóveis',
      'props.info_none': 'Nenhum imóvel encontrado.',
      'props.info_one': '1 imóvel.',
      'props.info_many': '{n} imóveis.',
      'props.empty_filters': 'Não há imóveis com esses filtros.',
      'props.empty_cta': 'Publicar um imóvel',
      'video_local.aria': 'Vídeo institucional',
      'video_local.fallback': 'Seu navegador não suporta vídeo incorporado.',
      'video_embed.open_tab': 'Abrir vídeo numa nova aba',
      'about.title': 'Quem somos',
      'about.text': 'A Imobiliária Pérez Araujo é sua parceira na busca do lar ideal. Especializamo-nos em venda e aluguel de imóveis na Colômbia, com atendimento personalizado e uma equipe comprometida em ajudá-lo a encontrar a melhor opção ou a publicar seu imóvel.',
      'about.cta': 'Tem alguma dúvida ou quer publicar um imóvel?',
      'contact.wa_span': 'Fale conosco no WhatsApp',
      'ios.title': 'Para instalar este app no seu iPhone:',
      'ios.li1': 'Toque no botão Compartilhar ⬆️ no Safari.',
      'ios.li2': 'Escolha <strong>Adicionar à Tela de Início</strong>.',
      'ios.li3': 'Confirme tocando em <strong>Adicionar</strong>.',
      'ios.close': 'Fechar',
      'install.btn': 'Instalar app',
      'install.aria': 'Instalar aplicativo',
      'footer.rights': '2026 Imobiliária Pérez Araujo. Todos os direitos reservados a Emil Jiménez Ortiz — Desenvolvedor Web',
      'tarjeta.fotos_mas': '+{n} fotos',
      'tarjeta.ver_video': '🎬 Ver vídeo',
      'tarjeta.venta': 'Venda',
      'tarjeta.arriendo': 'Aluguel',
      'tarjeta.por_dia': ' por dia',
      'tarjeta.codigo': 'Código do imóvel: ',
      'tarjeta.ver_mas': 'Ver mais fotos e vídeo',
      'tarjeta.fecha_in': 'Data de entrada',
      'tarjeta.fecha_out': 'Data de saída',
      'tarjeta.adultos': 'Adultos',
      'tarjeta.ninos': 'Crianças',
      'tarjeta.whatsapp': 'Consultar pelo WhatsApp',
      'tarjeta.sin_ubicacion': 'Sem localização',
      'tarjeta.consultar_precio': 'Consultar',
      'detalle.cargando': 'Carregando...',
      'detalle.no_encontrado': 'Imóvel não encontrado.',
      'detalle.volver': '← Voltar ao listado',
      'detalle.galeria_aria': 'Galeria de fotos',
      'detalle.toca_amp': 'Toque para ampliar',
      'detalle.video': 'Vídeo',
      'detalle.ver_video_ext': '🎬 Ver vídeo',
      'detalle.whatsapp': 'Consultar pelo WhatsApp',
      'detalle.foto_ant': 'Foto anterior',
      'detalle.foto_sig': 'Próxima foto',
      'detalle.ir_foto': 'Ir para foto {n}',
      'detalle.cerrar': 'Fechar',
      'detalle.amp_ant': 'Anterior',
      'detalle.amp_sig': 'Próxima',
      'detalle.codigo': 'Código do imóvel: ',
      'detalle.tap_more': 'Toque para ampliar',
      'msg.wa_general': 'Olá, acessei o site da Imobiliária Pérez Araujo. Gostaria de informações sobre imóveis (venda ou aluguel).',
      'msg.wa_prop_sale': 'Olá, tenho interesse neste imóvel para comprar:\n\n',
      'msg.wa_prop_rent': 'Olá, tenho interesse neste imóvel para alugar:\n\n',
      'msg.wa_prop_footer': '\n\nVi o anúncio no aplicativo web da Imobiliária Pérez Araujo.',
      'msg.wa_prop_codigo': 'Código do imóvel: ',
      'msg.wa_dia': 'Olá, tenho interesse neste imóvel para aluguel diário:\n\n',
      'msg.wa_dia_line_in': '*Data de entrada:* ',
      'msg.wa_dia_line_out': '*Data de saída:* ',
      'msg.wa_dia_adultos': '*Adultos:* ',
      'msg.wa_dia_ninos': '*Crianças:* ',
      'msg.wa_sin_codigo': 'Sem código',
      'pub.hero_title': 'Publicar imóvel',
      'pub.hero_sub': 'Preencha os dados e abriremos o WhatsApp para você nos enviar o anúncio.',
      'pub.label_nombre': 'Nome completo *',
      'pub.ph_nombre': 'Ex.: João Silva',
      'pub.label_tel': 'Celular *',
      'pub.ph_tel': 'Ex.: 300 123 4567',
      'pub.label_email': 'E-mail *',
      'pub.ph_email': 'Ex.: nome@exemplo.com',
      'pub.label_pais': 'País *',
      'pub.label_dept': 'Departamento',
      'pub.label_mun': 'Município',
      'pub.opt_sel_dept': 'Selecione o departamento',
      'pub.opt_sel_mun': 'Selecione o município',
      'pub.pais_list_aria': 'Selecionar país',
      'pub.label_zona': 'Zona / Bairro',
      'pub.ph_zona': 'Ex.: Centro, etc.',
      'pub.label_tipo_inm': 'Tipo de imóvel *',
      'pub.opt_tipo_inm': 'Selecione o tipo',
      'pub.label_valor': 'Valor estimado',
      'pub.ph_valor': 'Ex.: 150.000.000 ou 1.200.000/mês',
      'pub.label_mensaje': 'Sua mensagem *',
      'pub.ph_mensaje': 'Descreva o imóvel, características, contato preferido...',
      'pub.politica': 'Aceito a ',
      'pub.politica_link': 'Política de tratamento de dados',
      'pub.politica_fin': ' *',
      'pub.nota': 'Ao enviar, o WhatsApp abrirá com uma mensagem pronta. Envie para publicarmos seu anúncio.',
      'pub.btn': 'Enviar pelo WhatsApp',
      'opt.todos': 'Todos',
      'pub.alert_politica': 'Você deve aceitar a Política de tratamento de dados para continuar.',
      'pub.wa_1': 'Olá, quero *publicar* um imóvel no site da Imobiliária Pérez Araujo.',
      'pub.wa_name': '*Nome:* ',
      'pub.wa_cell': '*Celular:* ',
      'pub.wa_email': '*E-mail:* ',
      'pub.wa_country': '*País:* ',
      'pub.wa_dept': '*Departamento:* ',
      'pub.wa_mun': '*Município:* ',
      'pub.wa_zone': '*Zona / Bairro:* ',
      'pub.wa_type': '*Tipo de imóvel:* ',
      'pub.wa_price': '*Valor estimado:* ',
      'pub.wa_msg': '*Mensagem:*',
      'pub.wa_valor_def': 'A combinar',
      'pub.wa_footer': '_(Enviado pelo formulário Publicar do site)_',
      'pub.ph_sel': 'Selecione',
      'pwa.alert_android': 'O instalador automático não pode ser usado aqui.\n\nPara adicionar à tela inicial: menu do navegador (⋮) → «Adicionar à tela inicial» ou «Instalar app».',
      'pwa.alert_other': 'A instalação está disponível no Chrome para Android. Neste dispositivo, use o site no navegador.'
    },
    ru: {
      'meta.title_index': 'Недвижимость Pérez Araujo | Продажа и аренда',
      'meta.title_publicar': 'Разместить объект | Недвижимость Pérez Araujo',
      'meta.title_propiedad': 'Объект | Недвижимость Pérez Araujo',
      'meta.title_politica': 'Политика конфиденциальности | Недвижимость Pérez Araujo',
      'lang.label': 'Язык',
      'nav.home': 'Главная',
      'nav.publish': 'Разместить',
      'nav.about': 'О нас',
      'header.logo_aria': 'Главная',
      'hero.title': 'Ваше место, ваш момент — найдите его!',
      'hero.subtitle': 'Продажа и аренда по городам и муниципалитетам',
      'video_youtube.aria': 'Видео',
      'video_youtube.title_iframe': 'Видео агентства Pérez Araujo',
      'buscar.title': 'Поиск',
      'buscar.aria': 'Поиск объектов',
      'label.country': 'Страна',
      'label.department': 'Департамент',
      'label.municipality': 'Муниципалитет',
      'label.type': 'Тип',
      'filtro_pais_list_aria': 'Выбор страны',
      'opt.all_dept': 'Все департаменты',
      'opt.all_mun': 'Все муниципалитеты',
      'opt.type_any': 'Продажа или аренда',
      'opt.type_sale': 'Продажа',
      'opt.type_rent': 'Аренда',
      'opt.type_daily': 'Посуточно',
      'btn.search': 'Найти',
      'props.title': 'Объекты',
      'props.aria': 'Объекты',
      'props.info_none': 'Объекты не найдены.',
      'props.info_one': '1 объект.',
      'props.info_many': '{n} объектов.',
      'props.empty_filters': 'Нет объектов с такими фильтрами.',
      'props.empty_cta': 'Разместить объект',
      'video_local.aria': 'Корпоративное видео',
      'video_local.fallback': 'Ваш браузер не поддерживает встроенное видео.',
      'video_embed.open_tab': 'Открыть видео в новой вкладке',
      'about.title': 'О нас',
      'about.text': 'Агентство Pérez Araujo — ваш партнёр в поиске идеального жилья. Мы специализируемся на продаже и аренде недвижимости в Колумбии: персональный сервис и команда, которая поможет найти лучший вариант или разместить ваш объект.',
      'about.cta': 'Есть вопросы или хотите разместить объект?',
      'contact.wa_span': 'Написать в WhatsApp',
      'ios.title': 'Чтобы установить это приложение на iPhone:',
      'ios.li1': 'Нажмите кнопку «Поделиться» ⬆️ в Safari.',
      'ios.li2': 'Выберите <strong>На экран «Домой»</strong>.',
      'ios.li3': 'Подтвердите, нажав <strong>Добавить</strong>.',
      'ios.close': 'Закрыть',
      'install.btn': 'Установить приложение',
      'install.aria': 'Установить приложение',
      'footer.rights': '2026 Недвижимость Pérez Araujo. Все права защищены — Emil Jiménez Ortiz, веб-разработчик',
      'tarjeta.fotos_mas': '+{n} фото',
      'tarjeta.ver_video': '🎬 Смотреть видео',
      'tarjeta.venta': 'Продажа',
      'tarjeta.arriendo': 'Аренда',
      'tarjeta.por_dia': ' посуточно',
      'tarjeta.codigo': 'Код объекта: ',
      'tarjeta.ver_mas': 'Ещё фото и видео',
      'tarjeta.fecha_in': 'Дата заезда',
      'tarjeta.fecha_out': 'Дата выезда',
      'tarjeta.adultos': 'Взрослые',
      'tarjeta.ninos': 'Дети',
      'tarjeta.whatsapp': 'Связаться в WhatsApp',
      'tarjeta.sin_ubicacion': 'Адрес не указан',
      'tarjeta.consultar_precio': 'Уточнить',
      'detalle.cargando': 'Загрузка...',
      'detalle.no_encontrado': 'Объект не найден.',
      'detalle.volver': '← К списку',
      'detalle.galeria_aria': 'Фотогалерея',
      'detalle.toca_amp': 'Нажмите, чтобы увеличить',
      'detalle.video': 'Видео',
      'detalle.ver_video_ext': '🎬 Смотреть видео',
      'detalle.whatsapp': 'Связаться в WhatsApp',
      'detalle.foto_ant': 'Предыдущее фото',
      'detalle.foto_sig': 'Следующее фото',
      'detalle.ir_foto': 'К фото {n}',
      'detalle.cerrar': 'Закрыть',
      'detalle.amp_ant': 'Назад',
      'detalle.amp_sig': 'Далее',
      'detalle.codigo': 'Код объекта: ',
      'detalle.tap_more': 'Нажмите, чтобы увеличить',
      'msg.wa_general': 'Здравствуйте, я зашёл с сайта агентства Pérez Araujo. Хочу получить информацию об объектах (продажа или аренда).',
      'msg.wa_prop_sale': 'Здравствуйте, меня интересует этот объект для покупки:\n\n',
      'msg.wa_prop_rent': 'Здравствуйте, меня интересует этот объект для аренды:\n\n',
      'msg.wa_prop_footer': '\n\nОбъявление видел(а) в веб-приложении агентства Pérez Araujo.',
      'msg.wa_prop_codigo': 'Код объекта: ',
      'msg.wa_dia': 'Здравствуйте, меня интересует посуточная аренда этого объекта:\n\n',
      'msg.wa_dia_line_in': '*Дата заезда:* ',
      'msg.wa_dia_line_out': '*Дата выезда:* ',
      'msg.wa_dia_adultos': '*Взрослые:* ',
      'msg.wa_dia_ninos': '*Дети:* ',
      'msg.wa_sin_codigo': 'Без кода',
      'pub.hero_title': 'Разместить объект',
      'pub.hero_sub': 'Заполните форму — откроется WhatsApp с готовым сообщением.',
      'pub.label_nombre': 'Полное имя *',
      'pub.ph_nombre': 'Напр.: Иван Иванов',
      'pub.label_tel': 'Телефон *',
      'pub.ph_tel': 'Напр.: 300 123 4567',
      'pub.label_email': 'E-mail *',
      'pub.ph_email': 'Напр.: mail@example.com',
      'pub.label_pais': 'Страна *',
      'pub.label_dept': 'Департамент',
      'pub.label_mun': 'Муниципалитет',
      'pub.opt_sel_dept': 'Выберите департамент',
      'pub.opt_sel_mun': 'Выберите муниципалитет',
      'pub.pais_list_aria': 'Выбор страны',
      'pub.label_zona': 'Район / сектор',
      'pub.ph_zona': 'Напр.: центр и т. п.',
      'pub.label_tipo_inm': 'Тип объекта *',
      'pub.opt_tipo_inm': 'Выберите тип',
      'pub.label_valor': 'Ориентировочная цена',
      'pub.ph_valor': 'Напр.: 150 000 000 или 1 200 000/мес',
      'pub.label_mensaje': 'Сообщение *',
      'pub.ph_mensaje': 'Опишите объект, особенности, удобный способ связи...',
      'pub.politica': 'Я принимаю ',
      'pub.politica_link': 'политику обработки данных',
      'pub.politica_fin': ' *',
      'pub.nota': 'После отправки откроется WhatsApp с готовым текстом. Отправьте сообщение, чтобы мы опубликовали объявление.',
      'pub.btn': 'Отправить в WhatsApp',
      'opt.todos': 'Все',
      'pub.alert_politica': 'Примите политику обработки данных, чтобы продолжить.',
      'pub.wa_1': 'Здравствуйте, хочу *разместить* объект на сайте агентства Pérez Araujo.',
      'pub.wa_name': '*Имя:* ',
      'pub.wa_cell': '*Телефон:* ',
      'pub.wa_email': '*E-mail:* ',
      'pub.wa_country': '*Страна:* ',
      'pub.wa_dept': '*Департамент:* ',
      'pub.wa_mun': '*Муниципалитет:* ',
      'pub.wa_zone': '*Район / сектор:* ',
      'pub.wa_type': '*Тип объекта:* ',
      'pub.wa_price': '*Ориентировочная цена:* ',
      'pub.wa_msg': '*Сообщение:*',
      'pub.wa_valor_def': 'По договорённости',
      'pub.wa_footer': '_(Отправлено из формы «Разместить» на сайте)_',
      'pub.ph_sel': 'Выберите',
      'pwa.alert_android': 'Автоустановка здесь недоступна.\n\nДобавьте на главный экран: меню браузера (⋮) → «На экран Домой» или «Установить приложение».',
      'pwa.alert_other': 'Установка доступна в Chrome для Android. На этом устройстве пользуйтесь сайтом в браузере.'
    }
  };

  function normalizeLang(code) {
    if (!code || typeof code !== 'string') return FALLBACK;
    var c = code.toLowerCase().split('-')[0];
    if (c === 'ru') return 'ru';
    if (c === 'pt') return 'pt';
    if (c === 'en') return 'en';
    if (c === 'es') return 'es';
    return FALLBACK;
  }

  function getLang() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return normalizeLang(saved);
    } catch (e) { /* ignore */ }
    if (typeof navigator !== 'undefined' && navigator.language) {
      return normalizeLang(navigator.language);
    }
    return FALLBACK;
  }

  function setLang(code) {
    var lang = normalizeLang(code);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) { /* ignore */ }
    return lang;
  }

  function t(key, vars) {
    var lang = getLang();
    var raw = (M[lang] && M[lang][key]) || (M[FALLBACK] && M[FALLBACK][key]) || key;
    if (!vars) return raw;
    return raw.replace(/\{(\w+)\}/g, function (_, k) {
      return vars[k] != null ? String(vars[k]) : '';
    });
  }

  function applyDom(root) {
    var base = root || document;
    var lang = getLang();
    var htmlLang = lang === 'pt' ? 'pt-BR' : lang;
    document.documentElement.setAttribute('lang', htmlLang);

    base.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (!key) return;
      var val = t(key);
      var attr = el.getAttribute('data-i18n-attr');
      if (attr) {
        el.setAttribute(attr, val);
      } else if (el.tagName === 'TITLE') {
        el.textContent = val;
      } else {
        el.textContent = val;
      }
    });

    base.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-html');
      if (key) el.innerHTML = t(key);
    });

    base.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (key) el.setAttribute('placeholder', t(key));
    });

    base.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-aria');
      if (key) el.setAttribute('aria-label', t(key));
    });

    var page = document.body && document.body.getAttribute('data-i18n-page');
    if (page) {
      var tk = 'meta.title_' + page;
      if (M[lang] && M[lang][tk]) document.title = t(tk);
    }
  }

  var LANG_UI = [
    { code: 'es', flag: 'es', label: 'Español' },
    { code: 'en', flag: 'gb', label: 'English' },
    { code: 'pt', flag: 'br', label: 'Português' },
    { code: 'ru', flag: 'ru', label: 'Русский' }
  ];

  function langUiMeta(code) {
    var c = normalizeLang(code);
    for (var i = 0; i < LANG_UI.length; i++) {
      if (LANG_UI[i].code === c) return LANG_UI[i];
    }
    return LANG_UI[0];
  }

  function renderLangTriggerInner(container, code) {
    if (!container) return;
    var meta = langUiMeta(code);
    container.innerHTML = '';
    var img = document.createElement('img');
    img.src = 'https://flagcdn.com/' + meta.flag + '.svg';
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.className = 'header-lang__flag';
    img.width = 22;
    img.height = 16;
    var span = document.createElement('span');
    span.className = 'header-lang__name';
    span.textContent = meta.label;
    container.appendChild(img);
    container.appendChild(span);
  }

  function bindLangSelect() {
    var wrap = document.getElementById('header-lang-wrap');
    var trigger = document.getElementById('header-lang-trigger');
    var list = document.getElementById('header-lang-list');
    var inner = document.getElementById('header-lang-trigger-inner');
    if (!wrap || !trigger || !list || !inner) return;

    var current = getLang();
    renderLangTriggerInner(inner, current);

    function closeList() {
      list.classList.add('oculto');
      trigger.setAttribute('aria-expanded', 'false');
    }

    function openList() {
      list.classList.remove('oculto');
      trigger.setAttribute('aria-expanded', 'true');
    }

    trigger.addEventListener('click', function () {
      if (list.classList.contains('oculto')) openList();
      else closeList();
    });

    list.querySelectorAll('.header-lang-item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var v = normalizeLang(btn.getAttribute('data-lang'));
        if (v === getLang()) {
          closeList();
          return;
        }
        setLang(v);
        window.location.reload();
      });
    });

    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) closeList();
    });
  }

  function init() {
    applyDom();
    bindLangSelect();
  }

  window.I18n = {
    getLang: getLang,
    setLang: setLang,
    t: t,
    applyDom: applyDom,
    bindLangSelect: bindLangSelect,
    init: init,
    M: M
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
