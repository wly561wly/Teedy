package com.sismics.util;

import jakarta.json.JsonValue;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.junit.Assert;
import org.junit.Test;

import java.util.Locale;

public class TestUtilHelpers {
    @Test
    public void testLocaleUtil() {
        Locale defaultLocale = LocaleUtil.getLocale(null);
        Assert.assertEquals(Locale.ENGLISH, defaultLocale);

        Locale fr = LocaleUtil.getLocale("fr_FR");
        Assert.assertEquals("fr", fr.getLanguage());
        Assert.assertEquals("FR", fr.getCountry());

        Locale zhVariant = LocaleUtil.getLocale("zh_CN_CUSTOM");
        Assert.assertEquals("zh", zhVariant.getLanguage());
        Assert.assertEquals("CN", zhVariant.getCountry());
        Assert.assertEquals("CUSTOM", zhVariant.getVariant());
    }

    @Test
    public void testJsonUtilNullable() {
        Assert.assertEquals(JsonValue.NULL, JsonUtil.nullable((String) null));
        Assert.assertEquals(JsonValue.NULL, JsonUtil.nullable((Integer) null));
        Assert.assertEquals(JsonValue.NULL, JsonUtil.nullable((Long) null));

        Assert.assertEquals("abc", JsonUtil.nullable("abc").toString().replace("\"", ""));
        Assert.assertEquals("123", JsonUtil.nullable(123).toString());
        Assert.assertEquals("456", JsonUtil.nullable(456L).toString());
    }

    @Test
    public void testMessageUtil() {
        String message = MessageUtil.getMessage(Locale.ENGLISH,
                "email.template.password_recovery.hello", "Bob");
        Assert.assertEquals("Hello Bob.", message);

        String missing = MessageUtil.getMessage(Locale.ENGLISH, "missing.key");
        Assert.assertEquals("**missing.key**", missing);
    }

    @Test
    public void testLocaleUtilMoreLocales() {
        Locale zh = LocaleUtil.getLocale("zh_CN");
        Assert.assertEquals("zh", zh.getLanguage());
        Assert.assertEquals("CN", zh.getCountry());

        Locale de = LocaleUtil.getLocale("de_DE");
        Assert.assertEquals("de", de.getLanguage());
        Assert.assertEquals("DE", de.getCountry());

        Locale invalid = LocaleUtil.getLocale("invalid_locale");
        Assert.assertEquals("invalid", invalid.getLanguage());
        Assert.assertEquals("LOCALE", invalid.getCountry());
    }

    @Test
    public void testMessageUtilParameterized() {
        String message = MessageUtil.getMessage(Locale.ENGLISH,
                "email.template.password_recovery.hello", "Alice");
        Assert.assertEquals("Hello Alice.", message);

        String complex = MessageUtil.getMessage(Locale.ENGLISH,
                "some.template.with.{0}.and.{1}", "param1", "param2");
        Assert.assertEquals("**some.template.with.param1.and.param2**", complex); // Assuming no such key, it returns **key**
    }
}
