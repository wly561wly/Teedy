package com.sismics.docs.core.util.jpa;

import org.junit.Assert;
import org.junit.Test;

import java.util.Collections;

/**
 * Tests simple JPA utility helpers that do not require an EntityManager.
 */
public class TestPaginatedLists {
    @Test
    public void testPaginatedListsDefaultsAndLimits() {
        PaginatedList<Object> defaultList = PaginatedLists.create();
        Assert.assertEquals(10, defaultList.getLimit());
        Assert.assertEquals(0, defaultList.getOffset());

        PaginatedList<Object> customList = PaginatedLists.create(5, 2);
        Assert.assertEquals(5, customList.getLimit());
        Assert.assertEquals(2, customList.getOffset());

        PaginatedList<Object> cappedList = PaginatedLists.create(200, 1);
        Assert.assertEquals(100, cappedList.getLimit());
        Assert.assertEquals(1, cappedList.getOffset());
    }

    @Test
    public void testSortCriteriaAndSortedQueryParam() {
        SortCriteria defaultSort = new SortCriteria(null, null);
        Assert.assertEquals(0, defaultSort.getColumn());
        Assert.assertTrue(defaultSort.isAsc());

        SortCriteria descSort = new SortCriteria(2, false);
        Assert.assertEquals(2, descSort.getColumn());
        Assert.assertFalse(descSort.isAsc());

        QueryParam base = new QueryParam("select * from test", Collections.emptyMap());
        QueryParam unchanged = QueryUtil.getSortedQueryParam(base, null);
        Assert.assertEquals("select * from test", unchanged.getQueryString());

        QueryParam sortedAsc = QueryUtil.getSortedQueryParam(base, new SortCriteria(1, true));
        Assert.assertEquals("select * from test order by c1 asc", sortedAsc.getQueryString());

        QueryParam sortedDesc = QueryUtil.getSortedQueryParam(base, new SortCriteria(3, false));
        Assert.assertEquals("select * from test order by c3 desc", sortedDesc.getQueryString());
    }
}
