update T_CONFIG set CFG_VALUE_C = 'true' where CFG_ID_C = 'GUEST_LOGIN';

insert into T_DOCUMENT (
    DOC_ID_C,
    DOC_IDUSER_C,
    DOC_TITLE_C,
    DOC_DESCRIPTION_C,
    DOC_CREATEDATE_D,
    DOC_UPDATEDATE_D,
    DOC_LANGUAGE_C
)
select
    'guest_welcome_doc',
    'guest',
    'Guest welcome',
    'Default document available when visiting as guest.',
    NOW(),
    NOW(),
    'eng'
where exists (select 1 from T_USER where USE_ID_C = 'guest')
  and not exists (
      select 1
      from T_DOCUMENT
      where DOC_IDUSER_C = 'guest'
        and DOC_DELETEDATE_D is null
  );

update T_CONFIG set CFG_VALUE_C = '32' where CFG_ID_C = 'DB_VERSION';