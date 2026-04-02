-- ================================================
-- 补充 order_items 的 RLS 策略
-- 在 Supabase SQL Editor 新建查询，粘贴后 Run
-- 此文件在开始实现「查看订单明细」功能前执行即可
-- ================================================

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 用户只能访问属于自己订单的明细
CREATE POLICY "Users can read own order items"
    ON public.order_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
              AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own order items"
    ON public.order_items
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
              AND orders.user_id = auth.uid()
        )
    );
